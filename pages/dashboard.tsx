import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  FaPlus,
  FaPuzzlePiece,
  FaUsers,
  FaExternalLinkAlt,
  FaUserCircle,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { MdDashboard, MdFolder, MdGroup, MdSettings } from "react-icons/md";
import styles from "../styles/Dashboard.module.css";
import {
  getUserRooms,
  createNewRoom,
  deleteRoom,
  clearAllRooms,
  cleanupOrphanedRoom,
} from "../lib/collab";
import {
  getUserProjects,
  createProject,
  deleteProject,
  Project,
} from "../lib/projects";

// For rooms tab
interface RoomCard {
  id: string;
  name: string;
  lastVisited: Date;
  userCount: number;
  isCreator?: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rooms" | "projects">("rooms");

  // Check for tab query parameter and set the active tab accordingly
  useEffect(() => {
    const { tab } = router.query;
    if (tab === "projects") {
      setActiveTab("projects");
    } else if (tab === "rooms") {
      setActiveTab("rooms");
    }
  }, [router.query]);

  // Rooms state
  const [rooms, setRooms] = useState<RoomCard[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Shared state
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State for showing delete room confirmation
  const [showDeleteRoomConfirm, setShowDeleteRoomConfirm] = useState<
    string | null
  >(null);
  // State for showing clear all rooms confirmation
  const [showClearAllRoomsConfirm, setShowClearAllRoomsConfirm] =
    useState(false);
  // State for tracking if the user is an admin
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication and load user data
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Load initial data for the active tab
          if (activeTab === "rooms") {
            await loadRooms(currentUser.uid);
          } else {
            await loadProjects();
          }
        } catch (error) {
          console.error("Error loading data:", error);
          setErrorMessage("Failed to load data. Please refresh and try again.");
        } finally {
          setLoading(false);
        }
      } else {
        // Redirect to login if not authenticated
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load data when tab changes
  useEffect(() => {
    if (user) {
      if (activeTab === "rooms") {
        loadRooms(user.uid);
      } else {
        loadProjects();
      }
    }
  }, [activeTab, user]);

  // Check if the user is an admin
  useEffect(() => {
    if (user && user.email) {
      // You can define your own admin emails list here or check against a Firebase collection
      const adminEmails = ["akeilsmith3@gmail.com"]; // Example - replace with actual admin emails
      setIsAdmin(adminEmails.includes(user.email));
    }
  }, [user]);

  // Load rooms data
  const loadRooms = async (userId: string) => {
    try {
      setLoading(true);
      const userRooms = await getUserRooms(userId);
      const formattedRooms = userRooms.map((room: any) => ({
        id: room.roomId,
        name: room.name || room.roomId,
        lastVisited: room.lastVisited
          ? new Date(room.lastVisited.seconds * 1000)
          : new Date(),
        userCount: room.userCount || 1,
        isCreator: room.isCreator,
      }));

      setRooms(formattedRooms);
      setErrorMessage("");
    } catch (error) {
      console.error("Error loading rooms:", error);
      setErrorMessage("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load projects data
  const loadProjects = async () => {
    try {
      setLoading(true);
      const userProjects = await getUserProjects();
      setProjects(userProjects);
      setErrorMessage("");
    } catch (error) {
      console.error("Error loading projects:", error);
      setErrorMessage("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      setErrorMessage("Room name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const roomId = await createNewRoom(newRoomName, user?.uid || "");
      setShowNewRoomModal(false);
      setNewRoomName("");

      // Reload rooms to include the new one
      if (user) {
        await loadRooms(user.uid);
      }

      setSuccessMessage("Room created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error creating room:", error);
      setErrorMessage("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle joining a room by ID
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      setErrorMessage("Room ID cannot be empty");
      return;
    }

    // Navigate to the specified room
    router.push(`/workspace?roomId=${joinRoomId}`);
  };

  // Handle creating a new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setErrorMessage("Project name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await createProject(newProjectName, newProjectDescription);
      setIsCreatingProject(false);
      setNewProjectName("");
      setNewProjectDescription("");

      // Reload projects to include the new one
      await loadProjects();

      setSuccessMessage("Project created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error creating project:", error);
      setErrorMessage("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a project
  const handleDeleteProject = async (projectId: string) => {
    try {
      setLoading(true);
      await deleteProject(projectId);

      // Reload projects after deletion
      await loadProjects();
      setShowDeleteConfirm(null);

      setSuccessMessage("Project deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting project:", error);
      setErrorMessage("Failed to delete project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a room
  const handleDeleteRoom = async (roomId: string) => {
    try {
      setLoading(true);
      try {
        // First attempt to delete normally
        await deleteRoom(roomId);
      } catch (error) {
        console.error(
          "Error deleting room, attempting cleanup of orphaned reference:",
          error
        );

        // If that fails and user exists, try to clean up orphaned reference
        if (user) {
          await cleanupOrphanedRoom(roomId, user.uid);
        }
      }

      // Reload rooms after deletion
      if (user) {
        await loadRooms(user.uid);
      }
      setShowDeleteRoomConfirm(null);

      setSuccessMessage("Room closed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error closing room:", error);
      setErrorMessage("Failed to close room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle clearing all rooms (admin function)
  const handleClearAllRooms = async () => {
    try {
      setLoading(true);
      await clearAllRooms();

      // Reload rooms after clearing
      if (user) {
        await loadRooms(user.uid);
      }
      setShowClearAllRoomsConfirm(false);

      setSuccessMessage("All rooms cleared successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error clearing all rooms:", error);
      setErrorMessage("Failed to clear all rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>
      {/* Sidebar navigation */}
      <div className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo}>
            <FaPuzzlePiece />
            <span>BlocklyCollab</span>
          </Link>
        </div>

        <nav className={styles.navigation}>
          <ul>
            <li
              className={`${styles.navItem} ${
                activeTab === "rooms" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("rooms")}
            >
              <MdGroup className={styles.navIcon} />
              <span>Rooms</span>
            </li>
            <li
              className={`${styles.navItem} ${
                activeTab === "projects" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("projects")}
            >
              <MdFolder className={styles.navIcon} />
              <span>Projects</span>
            </li>
          </ul>
        </nav>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <FaUserCircle />
          </div>
          <div className={styles.userName}>
            {user?.displayName || user?.email || "User"}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className={styles.main}>
        {/* Header section */}
        <header className={styles.header}>
          <h1>
            {activeTab === "rooms" ? "Collaboration Rooms" : "My Projects"}
          </h1>

          <div className={styles.actions}>
            {activeTab === "rooms" ? (
              <>
                <button
                  className={styles.primaryButton}
                  onClick={() => setShowNewRoomModal(true)}
                >
                  <FaPlus /> Create Room
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setShowJoinRoomModal(true)}
                >
                  <FaUsers /> Join Room
                </button>
              </>
            ) : (
              <button
                className={styles.primaryButton}
                onClick={() => setIsCreatingProject(true)}
              >
                <FaPlus /> New Project
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        {errorMessage && (
          <div className={styles.errorMessage}>
            <p>{errorMessage}</p>
            <button onClick={() => setErrorMessage("")}>×</button>
          </div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage("")}>×</button>
          </div>
        )}

        {/* Content for the selected tab */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* Rooms Tab */}
              {activeTab === "rooms" && (
                <div className={styles.cardsGrid}>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div key={room.id} className={styles.card}>
                        <h3>{room.name}</h3>
                        <p className={styles.timestamp}>
                          Last visited: {formatDate(room.lastVisited)}
                        </p>
                        <p className={styles.userCount}>
                          <FaUsers /> {room.userCount}{" "}
                          {room.userCount === 1 ? "member" : "members"}
                        </p>
                        <div className={styles.cardActions}>
                          <Link
                            href={`/workspace?roomId=${room.id}`}
                            className={styles.actionButton}
                          >
                            <FaExternalLinkAlt /> Open Room
                          </Link>
                          {/* Add Close Room button */}
                          <button
                            className={styles.deleteButton}
                            onClick={() => setShowDeleteRoomConfirm(room.id)}
                          >
                            <FaTrash /> Close Room
                          </button>

                          {showDeleteRoomConfirm === room.id && (
                            <div className={styles.confirmDelete}>
                              <p>Are you sure you want to close this room?</p>
                              <div>
                                <button
                                  className={styles.confirmButton}
                                  onClick={() => handleDeleteRoom(room.id)}
                                >
                                  Yes, Close
                                </button>
                                <button
                                  className={styles.cancelButton}
                                  onClick={() => setShowDeleteRoomConfirm(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <MdGroup className={styles.emptyIcon} />
                      <h3>No rooms yet</h3>
                      <p>Create a new room to get started.</p>
                      <button
                        className={styles.primaryButton}
                        onClick={() => setShowNewRoomModal(true)}
                      >
                        <FaPlus /> New Room
                      </button>
                    </div>
                  )}

                  {/* Admin controls for clearing all rooms */}
                  {isAdmin && (
                    <div className={styles.adminControls}>
                      <h3>Admin Controls</h3>
                      <button
                        className={styles.dangerButton}
                        onClick={() => setShowClearAllRoomsConfirm(true)}
                      >
                        Clear All Rooms
                      </button>

                      {showClearAllRoomsConfirm && (
                        <div className={styles.confirmDelete}>
                          <p>
                            Are you sure you want to clear ALL rooms? This
                            cannot be undone!
                          </p>
                          <div>
                            <button
                              className={styles.confirmButton}
                              onClick={handleClearAllRooms}
                            >
                              Yes, Clear All
                            </button>
                            <button
                              className={styles.cancelButton}
                              onClick={() => setShowClearAllRoomsConfirm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === "projects" && (
                <div className={styles.cardsGrid}>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <div key={project.id} className={styles.card}>
                        <h3>{project.name}</h3>
                        {project.description && (
                          <p className={styles.description}>
                            {project.description}
                          </p>
                        )}
                        <p className={styles.timestamp}>
                          Created:{" "}
                          {formatDate(
                            new Date(project.createdAt.seconds * 1000)
                          )}
                        </p>

                        <div className={styles.cardActions}>
                          <Link
                            href={`/workspace?projectId=${project.id}`}
                            className={styles.actionButton}
                          >
                            <FaEdit /> Edit Project
                          </Link>
                          <button
                            className={styles.deleteButton}
                            onClick={() => setShowDeleteConfirm(project.id)}
                          >
                            <FaTrash /> Delete
                          </button>

                          {showDeleteConfirm === project.id && (
                            <div className={styles.confirmDelete}>
                              <p>
                                Are you sure you want to delete this project?
                              </p>
                              <div>
                                <button
                                  className={styles.confirmButton}
                                  onClick={() =>
                                    handleDeleteProject(project.id)
                                  }
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  className={styles.cancelButton}
                                  onClick={() => setShowDeleteConfirm(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <MdFolder className={styles.emptyIcon} />
                      <h3>No projects yet</h3>
                      <p>Create a new project to get started.</p>
                      <button
                        className={styles.primaryButton}
                        onClick={() => setIsCreatingProject(true)}
                      >
                        <FaPlus /> New Project
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Room Modal */}
      {showNewRoomModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Create New Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className={styles.formGroup}>
                <label htmlFor="roomName">Room Name</label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter a name for your room"
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowNewRoomModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinRoomModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Join Room</h2>
            <form onSubmit={handleJoinRoom}>
              <div className={styles.formGroup}>
                <label htmlFor="roomId">Room ID</label>
                <input
                  type="text"
                  id="roomId"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter the room ID"
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowJoinRoomModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreatingProject && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className={styles.formGroup}>
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter a name for your project"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="projectDescription">
                  Description (Optional)
                </label>
                <textarea
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter a brief description"
                  rows={3}
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
