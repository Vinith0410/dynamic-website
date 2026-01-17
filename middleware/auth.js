const AdminUser = require('../model/Admin.js');

function getUserIdFromCookie(req) {
  const cookieHeader = req.headers.cookie || '';
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const name = trimmed.substring(0, eqIndex);
    const value = trimmed.substring(eqIndex + 1);
    if (name === 'userId') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

function isAuthenticated(req, res, next) {
  const userId = getUserIdFromCookie(req);
  if (userId) {
    req.userId = userId;
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

function checkAuth(req, res, next) {
  const userId = getUserIdFromCookie(req);
  req.isLoggedIn = !!userId;
  req.userId = userId;
  next();
}

async function isAdmin(req, res, next) {
  try {
    const userId = getUserIdFromCookie(req);
    const adminMail = (process.env.ADMIN_MAIL || '').trim().toLowerCase();

    if (!userId || !adminMail) {
      const isApiRequest = req.xhr ||
        (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
        (req.headers['content-type'] && req.headers['content-type'].indexOf('json') > -1) ||
        req.path.startsWith('/cart/') ||
        req.path.startsWith('/api/');

      if (isApiRequest) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      return res.send(`
        <script>
          alert("Admin access required");
          window.location.href = "/";
        </script>
      `);
    }

    const user = await AdminUser.findById(userId);
    if (!user) {
      return res.send(`
        <script>
          alert("User not found");
          window.location.href = "/login";
        </script>
      `);
    }

    if (String(user.email || '').trim().toLowerCase() !== adminMail) {
      return res.send(`
        <script>
          alert("You do not have admin access");
          window.location.href = "/";
        </script>
      `);
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('isAdmin error:', error);
    return res.status(500).send(`
      <script>
        alert("Server error");
        window.location.href = "/";
      </script>
    `);
  }
}

module.exports = {
  isAuthenticated,
  checkAuth,
  getUserIdFromCookie,
  isAdmin
};

