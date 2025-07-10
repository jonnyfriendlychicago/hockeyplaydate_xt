-- ==========================================
-- Function name:   promote_auth_user_swap
-- Purpose:         Promotes a duplicate auth_user to primary, demotes the current primary,
--                  swaps the linked user_profile records, and logs the change in audit table.
-- Directions:      Run this statement once to commit/save it to the database.  
--                  Once that is done, it can be invoked/run with the "promoted au" parameter by running the following: 

--                  SELECT promote_auth_user_swap(X);

--                  ... and replace X above with the auth_user.id value of the auth_user record you want to promote. 

-- ==========================================

CREATE OR REPLACE FUNCTION promote_auth_user_swap(promoted_auth_user_id_input INT)
RETURNS void AS $$
    -- Step Zero: declare staging tables
DECLARE
    -- PROMOTED = the auth_user currently marked as a duplicate (we're promoting it)
    promoted_auth_user auth_user;
    precluded_user_profile user_profile;

    -- DEMOTED = the current primary auth_user (we're demoting it)
    demoted_auth_user auth_user;
    maintained_user_profile user_profile;

    postop_promoted_auth_user auth_user;
    postop_precluded_user_profile user_profile;

    -- DEMOTED = the current primary auth_user (we're demoting it)
    postop_demoted_auth_user auth_user;
    postop_maintained_user_profile user_profile;

BEGIN
    -- Step I: Load all staging records
    -- 1: verify/set0up promoted auth user
    -- 1a: Look up the auth_user to be promoted
    SELECT * INTO promoted_auth_user FROM auth_user WHERE id = promoted_auth_user_id_input;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No auth_user found with ID %', promoted_auth_user_id_input;
    END IF;

    -- 1b: Ensure this user is currently a duplicate (must have duplicateof_id)
    IF promoted_auth_user.duplicateof_id IS NULL THEN
        RAISE EXCEPTION 'auth_user % is already promoted (duplicateof_id is null)', promoted_auth_user.id;
    END IF;

    -- 2: Find the currently promoted (non-dupe) account with same email
    SELECT * INTO demoted_auth_user
    FROM auth_user
    WHERE email = promoted_auth_user.email
      AND duplicateof_id IS NULL
      AND id <> promoted_auth_user.id
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No promoted (non-duplicate) auth_user found for email %', promoted_auth_user.email;
    END IF;

    -- 3: Get both associated user_profile records
    SELECT * INTO precluded_user_profile FROM user_profile WHERE user_id = promoted_auth_user.id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No user_profile found for promoted auth_user.id = %', promoted_auth_user.id;
    END IF;

    SELECT * INTO maintained_user_profile FROM user_profile WHERE user_id = demoted_auth_user.id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No user_profile found for demoted auth_user.id = %', demoted_auth_user.id;
    END IF;

    -- Step II: apply changes to live DB records
    -- 1: Reassign user_profiles

    -- 1a: temporarily unlink both user_profiles
    UPDATE user_profile
    SET user_id = NULL
    WHERE id IN (maintained_user_profile.id, precluded_user_profile.id);

    -- 1b:  link maintained up => promoted au
    UPDATE user_profile
    SET user_id = promoted_auth_user.id
    WHERE id = maintained_user_profile.id;

    -- 1c:  link precluded up => demoted au
    UPDATE user_profile
    SET user_id = demoted_auth_user.id
    WHERE id = precluded_user_profile.id;

    -- 2a: Promote targeted auth_user account
    UPDATE auth_user
    SET duplicateof_id = NULL
    WHERE id = promoted_auth_user.id;

    -- 2b: Demote targeted auth_user account
    UPDATE auth_user
    SET duplicateof_id = promoted_auth_user.id
    WHERE id = demoted_auth_user.id;

    -- Step III: capture changes in audit table
    -- 1: load up now-is staging tables

    SELECT * INTO postop_promoted_auth_user FROM auth_user WHERE id = promoted_auth_user.id;
    SELECT * INTO postop_demoted_auth_user FROM auth_user WHERE id = demoted_auth_user.id;
    SELECT * INTO postop_maintained_user_profile FROM user_profile WHERE id = maintained_user_profile.id;
    SELECT * INTO postop_precluded_user_profile FROM user_profile WHERE id = precluded_user_profile.id;

    -- 2: Write to the audit table with all before/after state
    INSERT INTO authuser_userprofile_swap_audit (
        promoted_auth_user_email,
        demoted_auth_user_email,
        promoted_auth_user_auth0_id,
        demoted_auth_user_auth0_id,

        promoted_auth_user_id,
        promoted_auth_user_duplicateof_id_initial,
        promoted_auth_user_duplicateof_id_post,

        demoted_auth_user_id,
        demoted_auth_user_duplicateof_id_initial,
        demoted_auth_user_duplicateof_id_post,

        maintained_user_profile_id,
        maintained_user_profile_user_id_initial,
        maintained_user_profile_user_id_post,

        precluded_user_profile_id,
        precluded_user_profile_userid_initial,
        precluded_user_profile_userid_post,

        created_at
    ) VALUES (
        promoted_auth_user.email,
        demoted_auth_user.email,
        promoted_auth_user.auth0_id,
        demoted_auth_user.auth0_id,

        promoted_auth_user.id,
        promoted_auth_user.duplicateof_id,
--         NULL, -- I'd like this to be the actual new value found in the db, rather than hardcoded , yes?
        postop_promoted_auth_user.duplicateof_id ,

        demoted_auth_user.id,
--         NULL, -- shouldn't this be: demoted_auth_user.duplicateof_id ?
        demoted_auth_user.duplicateof_id ,
--         promoted_auth_user.id, -- I'd like this to be the actual new value found in the db, rather than hardcoded, yes?
        postop_demoted_auth_user.duplicateof_id ,

        maintained_user_profile.id,
        maintained_user_profile.user_id,
--         promoted_auth_user.id, -- I'd like this to be the actual new value found in the db, rather than hardcoded, yes?
        postop_maintained_user_profile.user_id ,

        precluded_user_profile.id,
        precluded_user_profile.user_id,
--         demoted_auth_user.id, -- I'd like this to be the actual new value found in the db, rather than hardcoded, yes?
        postop_precluded_user_profile.user_id ,

        now()
    );

END;
$$ LANGUAGE plpgsql;
