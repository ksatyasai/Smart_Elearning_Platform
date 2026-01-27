// Validation helper
export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 6 characters
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length > 0;
};

// Pagination helper
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, skip };
};

// Build query params
export const buildQuery = (filters) => {
  const query = {};

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.level) {
    query.level = filters.level;
  }

  if (filters.instructor) {
    query.instructor = filters.instructor;
  }

  if (filters.isPublished !== undefined) {
    query.isPublished = filters.isPublished;
  }

  return query;
};
