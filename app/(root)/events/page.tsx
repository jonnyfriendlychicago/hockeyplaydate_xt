// app/(root)/events/page.tsx

export default async function Events() {

    return ( 
        <main>
          <h1>Events Page (Placeholder)</h1>
          <p>
            This is a placeholder page for what eventually will be the production events page. <br/>
            Non-authenticated users will see an about-events info blurb, with some examples of what authenticated users will see. <br/>
            Authenticated users will see an expandable minimized version of that info blurb, PLUS: 
            a card array of all hockey playdate events which were sponsored/organized by/under a group that the user is a member of. <br/>
            Will display all past and future events which fit above criteria.
            Anticipated features will include search/filtering, especially as it relates to events attended, etc. 
            </p>
        </main>
      );
    } 