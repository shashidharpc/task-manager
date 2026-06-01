const API_BASE_URL = "https://task-manager-zabj.onrender.com";

function getToken() 
{
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Cannot connect to server. Please check your connection.");
    }
    throw err;
  }
}

const AuthService = {
  async register(name, email, password) {
    const data = await apiRequest("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  async login(email, password) {
    const data = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  },

  isLoggedIn() {
    return !!getToken();
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

const TaskService = {
  async getTasks() {
    return await apiRequest("/tasks");
  },

  async createTask(title, description, status) {
    return await apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description, status }),
    });
  },

  async updateTask(id, updates) {
    return await apiRequest(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(id) {
    return await apiRequest(`/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
