import React from 'react'


function Home() {
  
  return (

     <div>
      <section className="text-center p-5 bg-light">
        <h1>Discover. Connect. Celebrate.</h1>
        <p>Your one-stop platform for all college events and activities!</p>
        <button className="btn btn-primary mt-3" >Explore Events</button>
      </section>

      <section className="container py-5">
        <h2>Welcome to CIT Events Portal 🎉</h2>
        <p>
          Stay up to date with all the happenings across campus — from national-level symposiums and cultural fests to
          technical hackathons and green drives. We bring every event closer to you, so you never miss an opportunity to
          participate, learn, and grow.
        </p>
      </section>

      <section className="bg-light py-4 text-center">
        <h3>Highlights</h3>
        <div className="d-flex justify-content-center gap-4 mt-3">
          <div>🎫 Explore Events</div>
          <div>🤝 Create Connections</div>
          <div>🏆 Earn Recognition</div>
        </div>
      </section>

      <section className="text-center p-5">
        <h2>Ready to be part of the action?</h2>
        <p>Join us in making every campus event a memorable experience.</p>
        <button className="btn btn-success">View Upcoming Events</button>
      </section>
    </div>
  )
}

export default Home