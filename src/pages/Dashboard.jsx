import { useState, useEffect } from "react";
import {
  fetchContractorById,
  updateContractorProfile,
  listenToContractorChats,
} from "../firebase/firestoreFunctions";
import { uploadPhoto, addPhotoToProject } from "../firebase/firestoreFunctions";

function Dashboard({ currentUser, onBack, onOpenChat }) {
  const [contractor, setContractor] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    value: "",
    date: "",
    review: "",
  });
  const [addingProject, setAddingProject] = useState(false);

  const [form, setForm] = useState({
    name: "",
    about: "",
    specialty: "",
    experience: "",
    available: true,
  });

  useEffect(() => {
    const loadContractor = async () => {
      const data = await fetchContractorById(currentUser.uid);
      if (data) {
        setContractor(data);
        setForm({
          name: data.name || "",
          about: data.about || "",
          specialty: data.specialty || "",
          experience: data.experience || "",
          available: data.available ?? true,
        });
      }
      setLoading(false);
    };
    loadContractor();
  }, [currentUser.uid]);

  useEffect(() => {
    const unsubscribe = listenToContractorChats(currentUser.uid, (data) => {
      setChats(data);
    });
    return () => unsubscribe();
  }, [currentUser.uid]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const result = await updateContractorProfile(currentUser.uid, {
      name: form.name,
      about: form.about,
      specialty: form.specialty,
      experience: Number(form.experience),
      available: form.available,
      location: contractor.city,
    });
    setSaving(false);
    if (result.success) {
      setSaveMsg("Profile saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.title.trim()) return;
    setAddingProject(true);

    const updatedHistory = [
      ...(contractor.workHistory || []),
      {
        title: newProject.title,
        value: newProject.value,
        date: newProject.date,
        review: newProject.review,
        photos: [],
      },
    ];

    const result = await updateContractorProfile(currentUser.uid, {
      workHistory: updatedHistory,
      projects: updatedHistory.length,
    });

    if (result.success) {
      setContractor((prev) => ({
        ...prev,
        workHistory: updatedHistory,
        projects: updatedHistory.length,
      }));
      setNewProject({ title: "", value: "", date: "", review: "" });
    }

    setAddingProject(false);
  };

  const handlePhotoUpload = async (e, projectIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadResult = await uploadPhoto(currentUser.uid, file, projectIndex);
    if (uploadResult.success) {
      await addPhotoToProject(currentUser.uid, projectIndex, uploadResult.url);
      const updated = await fetchContractorById(currentUser.uid);
      setContractor(updated);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage your profile and messages
          </p>
        </div>
        <button onClick={onBack} className="text-sm text-blue-600">
          ← Home
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {contractor?.projects || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Projects</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {contractor?.rating || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Rating</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{chats.length}</div>
          <div className="text-xs text-gray-500 mt-1">Chats</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["profile", "work history", "messages"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`mr-6 pb-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Full name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Specialty
            </label>
            <input
              type="text"
              value={form.specialty}
              onChange={(e) =>
                setForm((p) => ({ ...p, specialty: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Years of experience
            </label>
            <input
              type="number"
              value={form.experience}
              onChange={(e) =>
                setForm((p) => ({ ...p, experience: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              About
            </label>
            <textarea
              value={form.about}
              onChange={(e) =>
                setForm((p) => ({ ...p, about: e.target.value }))
              }
              rows={4}
              className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Available for projects
              </p>
              <p className="text-xs text-gray-400">
                Clients can see your availability
              </p>
            </div>
            <button
              onClick={() =>
                setForm((p) => ({ ...p, available: !p.available }))
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                form.available ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.available ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {saveMsg && (
            <p className="text-sm text-green-600 text-center">{saveMsg}</p>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-medium text-sm transition-colors"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      )}

      {/* Work history tab */}
      {activeTab === "work history" && (
        <div className="flex flex-col gap-4">
          {/* Add new project form */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-3">
              Add new project
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Project title e.g. 3BHK Villa — Sector 21, Faridabad"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full border border-blue-200 focus:border-blue-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Project value e.g. ₹48L"
                  value={newProject.value}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, value: e.target.value }))
                  }
                  className="flex-1 border border-blue-200 focus:border-blue-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white"
                />
                <input
                  type="text"
                  placeholder="Date e.g. Feb 2024"
                  value={newProject.date}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, date: e.target.value }))
                  }
                  className="flex-1 border border-blue-200 focus:border-blue-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white"
                />
              </div>
              <input
                type="text"
                placeholder="Client review e.g. Excellent work, delivered on time"
                value={newProject.review}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, review: e.target.value }))
                }
                className="w-full border border-blue-200 focus:border-blue-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white"
              />
              <button
                onClick={handleAddProject}
                disabled={addingProject}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {addingProject ? "Adding..." : "Add project"}
              </button>
            </div>
          </div>

          {/* Existing projects */}
          {(!contractor.workHistory || contractor.workHistory.length === 0) && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No projects yet. Add your first project above!
            </div>
          )}

          {contractor.workHistory?.map((work, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Uploaded photos */}
              {work.photos && work.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5 bg-gray-100">
                  {work.photos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Work"
                      className="h-24 w-full object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 h-16 flex items-center justify-center">
                  <p className="text-xs text-gray-300">No photos yet</p>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {work.title}
                  </h3>
                  <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                    {work.value}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{work.date}</p>
                <p className="text-sm text-gray-500 mt-1 italic">
                  "{work.review}"
                </p>

                {/* Photo upload */}
                <label className="mt-3 flex items-center gap-2 cursor-pointer group">
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 group-hover:text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                    <span>📷</span>
                    <span>Upload photo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, index)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages tab */}
      {activeTab === "messages" && (
        <div className="flex flex-col gap-3">
          {chats.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No messages yet</p>
              <p className="text-gray-300 text-xs mt-1">
                When clients message you, they'll appear here
              </p>
            </div>
          )}
          {chats.map((chat) => {
            const initials = (chat.senderName || "G")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={chat.chatId}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {chat.senderName || "Guest"}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {chat.lastMessage}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {chat.createdAt?.toDate
                        ? chat.createdAt.toDate().toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </p>
                    <button
                      onClick={() => onOpenChat(chat.senderId, chat.senderName)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                      Reply →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
