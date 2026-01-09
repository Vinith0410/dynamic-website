/* ================== AUTHENTICATION MIDDLEWARE ================== */

// Check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  
  // Check if it's an API/AJAX request
  const isApiRequest = req.xhr || 
                       (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
                       (req.headers['content-type'] && req.headers['content-type'].indexOf('json') > -1) ||
                       req.path.startsWith('/cart/') ||
                       req.path.startsWith('/api/');
  
  if (isApiRequest) {
    return res.status(401).json({ 
      success: false, 
      message: 'You are not logged in. Please login first to continue.',
      redirect: '/login'
    });
  }
  
  // If it's a page request, redirect to login
  res.redirect('/login');
}

// Check login status (doesn't block, just returns info)
function checkAuth(req, res, next) {
  req.isLoggedIn = !!(req.session && req.session.userId);
  req.userId = req.session?.userId || null;
  next();
}

module.exports = {
  isAuthenticated,
  checkAuth
};

