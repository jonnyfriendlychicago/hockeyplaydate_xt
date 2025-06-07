// app/(root)/dashboard/page.tsx

export default async function Dashboard() {

    return ( 
        <main>
          <h1>Dashboard Page (Placeholder)</h1>
          <p>
            This is a placeholder page for what eventually will be the production dashboard page. <br/>
            Non-authenticated users will see an about-dashboard info blurb, with some examples of what authenticated users will see. <br/>
            Authenticated users will see an expandable minimized version of that info blurb, PLUS: 
            framed-off areas providing the most time-sensitive or personally/immediately relevent HPD data about that user.  <br/>
            Examples of framed areas include: events (just ocurred last 3 weeks / occuring next 3 weeks); groups that users is a member of; full prospectus on first upcoming playdate: date, time, location, map, organizer, etc. 
            Note to future self: authenticated users directed here as the home screen; non-authenticated users go to actual home page. 
            </p>
        </main>
      );
    } 