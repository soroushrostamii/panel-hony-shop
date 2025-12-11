import api from "./client";

const unwrap = (request) => request.then((res) => res.data);

export const authApi = {
  login: (email, password) =>
    unwrap(
      api.post("/api/auth/login", {
        email,
        password
      })
    ),
  me: () => unwrap(api.get("/api/auth/me"))
};

export const productApi = {
  list: () => unwrap(api.get("/api/products")),
  create: (payload) => unwrap(api.post("/api/products", payload)),
  update: ({ id, ...payload }) => unwrap(api.put(`/api/products/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/api/products/${id}`))
};

export const inventoryApi = {
  list: () => unwrap(api.get("/api/inventory")),
  adjust: ({ productId, ...payload }) =>
    unwrap(api.patch(`/api/inventory/${productId}`, payload))
};

export const blogApi = {
  list: () => unwrap(api.get("/api/blogs")),
  create: (payload) =>
    unwrap(
      api.post("/api/blogs", buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    ),
  update: ({ id, ...payload }) =>
    unwrap(
      api.put(`/api/blogs/${id}`, buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    ),
  remove: (id) => unwrap(api.delete(`/api/blogs/${id}`))
};

export const categoryApi = {
  list: () => unwrap(api.get("/api/categories")),
  create: (payload) => unwrap(api.post("/api/categories", payload)),
  update: ({ id, ...payload }) => unwrap(api.put(`/api/categories/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/api/categories/${id}`))
};

export const userApi = {
  list: () => unwrap(api.get("/api/users")),
  create: (payload) => unwrap(api.post("/api/users", payload)),
  update: ({ id, ...payload }) => unwrap(api.put(`/api/users/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/api/users/${id}`)),
  sendNotification: ({ id, ...payload }) =>
    unwrap(api.post(`/api/users/${id}/notifications`, payload))
};

export const orderApi = {
  list: (params = {}) => unwrap(api.get("/api/orders", { params })),
  create: (payload) => unwrap(api.post("/api/orders", payload)),
  updateStatus: ({ id, status }) =>
    unwrap(api.patch(`/api/orders/${id}/status`, { status })),
  remove: ({ id, restock = false }) =>
    unwrap(api.delete(`/api/orders/${id}`, { params: { restock } })),
  statuses: () => unwrap(api.get("/api/orders/meta/statuses"))
};

export const reviewsApi = {
  list: (params = {}) => unwrap(api.get("/api/reviews", { params })),
  update: ({ id, ...payload }) => unwrap(api.patch(`/api/reviews/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/api/reviews/${id}`))
};

const buildFormData = (payload = {}) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "imageFile" || key === "logoFile" || key === "coverImageFile") {
      if (value) formData.append(key, value);
    } else if (key !== "imageFilePreview" && key !== "logoFilePreview" && key !== "coverImageFilePreview") {
      // Handle arrays (like tags)
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "boolean") {
        formData.append(key, value.toString());
      } else {
        formData.append(key, value);
      }
    }
  });
  return formData;
};

export const adsApi = {
  list: (params = {}) => unwrap(api.get("/api/ads", { params })),
  create: (payload) =>
    unwrap(
      api.post("/api/ads", buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    ),
  update: ({ id, ...payload }) =>
    unwrap(
      api.put(`/api/ads/${id}`, buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    ),
  remove: (id) => unwrap(api.delete(`/api/ads/${id}`))
};

export const reviewApi = {
  list: (params = {}) => unwrap(api.get("/api/comments", { params })),
  update: ({ id, ...payload }) => unwrap(api.put(`/api/comments/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/api/comments/${id}`))
};

export const contactApi = {
  list: (params = {}) => unwrap(api.get("/api/contact", { params })),
  get: (id) => unwrap(api.get(`/api/contact/${id}`)),
  updateStatus: ({ id, status, replyMessage }) =>
    unwrap(api.patch(`/api/contact/${id}/status`, { status, replyMessage })),
  remove: (id) => unwrap(api.delete(`/api/contact/${id}`))
};

export const bannerApi = {
  list: (params = {}) => unwrap(api.get("/api/banners", { params })),
  create: (payload) =>
    unwrap(
      api.post("/api/banners", buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    ),
  update: ({ id, ...payload }) =>
    unwrap(
      api.put(`/api/banners/${id}`, buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    ),
  remove: (id) => unwrap(api.delete(`/api/banners/${id}`))
};

export const brandApi = {
  list: (params = {}) => unwrap(api.get("/api/brands", { params })),
  create: (payload) =>
    unwrap(
      api.post("/api/brands", buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    ),
  update: ({ id, ...payload }) =>
    unwrap(
      api.put(`/api/brands/${id}`, buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    ),
  remove: (id) => unwrap(api.delete(`/api/brands/${id}`))
};

export const dealApi = {
  list: (params = {}) => unwrap(api.get("/api/deals", { params })),
  create: (payload) => unwrap(api.post("/api/deals", payload)),
  update: ({ id, ...payload }) => unwrap(api.put(`/api/deals/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/api/deals/${id}`))
};

