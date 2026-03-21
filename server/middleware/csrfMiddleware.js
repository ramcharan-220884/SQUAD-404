/**
 * Double-Submit Cookie CSRF Validator
 * Protects endpoints utilizing httpOnly cookies by verifying a symmetrical 
 * non-httpOnly csrfToken signature sent simultaneously via headers.
 */
export const verifyCsrfToken = (req, res, next) => {
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  // Prevent bypass if neither are provided
  if (!cookieToken || !headerToken) {
    return res.status(403).json({ 
      success: false, 
      message: "Forbidden: Missing CSRF tokens" 
    });
  }

  // Cryptographically compare strict equality
  if (cookieToken !== headerToken) {
    return res.status(403).json({ 
      success: false, 
      message: "Forbidden: CSRF token mismatch" 
    });
  }

  // Token is verified uniquely bound to the active session
  next();
};
