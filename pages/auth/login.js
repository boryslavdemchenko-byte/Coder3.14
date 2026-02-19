<div>
  <form>
    {/* Other form fields */}
    <div>
      <label htmlFor="password">Password</label>
      <input type="password" id="password" name="password" />
      {/* Possible error handling for password */}
    </div>

    {/* Error/success message block moved here */}
    {message && <div className={messageType}>{message}</div>}

    {/* isResend conditional moved after the message */}
    {isResend && <div>Resend link or messages here</div>}
    {/* Other elements like submit button */}
  </form>
</div>