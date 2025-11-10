import React from 'react'

// Simple Razorpay client-side prototype
// You need to add your Razorpay key id to VITE_RAZORPAY_KEY

export default function Donation({ amount=100, eventName='College Event' }){
  const handleDonate = async ()=>{
    const key = import.meta.env.VITE_RAZORPAY_KEY || ''
    if(!key) return alert('Set VITE_RAZORPAY_KEY in .env')

    // For real flow, backend needs to create an order and return order_id.
    // This prototype will open Razorpay test checkout with minimal details (notes: this won't capture payment server-side).
    const options = {
      key,
      amount: amount*100,
      name: 'CIT AlConn (Test)',
      description: eventName,
      handler: function(response){
        alert('Donation completed (test). Payment id: ' + response.razorpay_payment_id)
      }
    }

    // load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = ()=>{
      // In a proper integration, create order on server and pass order_id here
      const rzp = new window.Razorpay(options)
      rzp.open()
    }
    script.onerror = ()=> alert('Failed to load Razorpay')
    document.body.appendChild(script)
  }

  return <button onClick={handleDonate}>Donate ₹{amount} for {eventName}</button>
}
