// app/(root)/groups/page.tsx

export default async function Groups() {

return ( 
    <main>
      <h1>Groups Page (Placeholder)</h1>
      <p>
        This is a placeholder page for what eventually will be the production groups page. <br/>
        Non-authenticated users will see an about-groups info blurb, with some examples of what authenticated users will see. <br/>
        Authenticated users will see an expandable minimized version of that info blurb, PLUS: 
        a card array of all hockey playdate groups, with indicators on any group that authorized user is a member of. <br/>
        Key aspects info of playdate groups shall include: name of organizer(s); geography/locale (e.g. central chicago); rink(s) they play at; etc.
        Anticipated features will include search/filtering, etc. 
        </p>
    </main>
  );
} 