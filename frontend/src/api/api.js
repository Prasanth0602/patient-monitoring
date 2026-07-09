import API from "./axiosConfig";

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const registerDoctor = (data) => API.post("/doctors/register", data);
export const loginDoctor = (data) => API.post("/doctors/login", data);
export const getDoctors = () => API.get("/doctors/");

// ─── Patients ─────────────────────────────────────────────────────────────────
export const getPatients = () => API.get("/patients/");
export const getPatientsByDoctor = (doctorId) => API.get(`/patients/by-doctor/${doctorId}`);
export const getPatient = (id) => API.get(`/patients/${id}`);
export const createPatient = (data) => API.post("/patients/", data);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);

// ─── Vitals ───────────────────────────────────────────────────────────────────
export const recordVitals = (data) => API.post("/vitals/", data);
export const getVitalsForPatient = (patientId) => API.get(`/vitals/patient/${patientId}`);
export const getLatestVitals = (patientId) => API.get(`/vitals/latest/${patientId}`);

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const getAlerts = () => API.get("/alerts/");
export const getActiveAlerts = () => API.get("/alerts/active");
export const getAlertsForPatient = (patientId) => API.get(`/alerts/patient/${patientId}`);
export const resolveAlert = (id) => API.patch(`/alerts/${id}/resolve`);
export const deleteAlert = (id) => API.delete(`/alerts/${id}`);

// ─── Reports ──────────────────────────────────────────────────────────────────
export const getReports = () => API.get("/reports/");
export const createReport = (data) => API.post("/reports/", data);
export const getReportsForPatient = (patientId) => API.get(`/reports/patient/${patientId}`);
export const deleteReport = (id) => API.delete(`/reports/${id}`);
