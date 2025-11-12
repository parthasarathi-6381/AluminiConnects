import React from 'react'
import { Link } from 'react-router-dom'  
function Navbar() {
  return (
    <div>
        <Link to="/home" className='btn btn-light m-3'>Home</Link>
        <Link to='/events' className='btn btn-light m-3'>Events</Link>
        <Link to='/donations' className='btn btn-light m-3 solid'>Donations</Link>
        <Link to='/message' className='btn btn-light m-3 solid'>Messages</Link>
            
    </div>
  )
}

export default Navbar