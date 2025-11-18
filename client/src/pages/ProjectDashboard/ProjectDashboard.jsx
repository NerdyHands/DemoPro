import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';
import config from '../../config/config.jsx';

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProjects();
        
        // Handle different response formats
        let projectsData = response;
        console.log('Raw API response:', response);
        
        if (response && typeof response === 'object') {
          // Handle server response format: { projects: [...], pagination: {...} }
          if (response.projects && Array.isArray(response.projects)) {
            projectsData = response.projects;
            console.log('Extracted projects from response:', projectsData);
          }
          // Handle alternative response format: { data: [...] }
          else if (response.data && Array.isArray(response.data)) {
            projectsData = response.data;
            console.log('Extracted data from response:', projectsData);
          }
        }
        
        // Ensure projectsData is an array
        if (!Array.isArray(projectsData)) {
          console.error('Invalid projects data format:', projectsData);
          console.error('Type of projectsData:', typeof projectsData);
          setError('Invalid data format received from server.');
          setProjects([]);
          return;
        }
        
        setProjects(projectsData);
        setError(null);
      } catch (err) {
        console.error('Failed to load projects:', err);
        
        // If we're in development and the API fails, try to use fake data as fallback
        if (process.env.NODE_ENV === 'development' && !config.useFakeData) {
          console.log('Attempting to use fake data as fallback...');
          try {
            const fakeService = new (await import('../../services/fakeData')).default();
            const fakeProjects = await fakeService.getProjects();
            setProjects(fakeProjects);
            setError(null);
            console.log('Successfully loaded fake data as fallback');
          } catch (fakeError) {
            console.error('Fake data fallback also failed:', fakeError);
            setError('Failed to load projects. Please try again.');
            setProjects([]);
          }
        } else {
          setError('Failed to load projects. Please try again.');
          setProjects([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
    // Filter by tab
    if (activeTab === 'inProgress' && project.status !== 'In Progress') return false;
    if (activeTab === 'completed' && project.status !== 'Completed') return false;
    if (activeTab === 'pending' && project.status !== 'Pending') return false;
    
    // Filter by search term
    if (searchTerm && !project.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !project.address?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return '#ff6b35';
      case 'Completed':
        return '#4CAF50';
      case 'Pending':
        return '#FFC107';
      default:
        return '#888888';
    }
  };

  const handleViewDetails = (projectId) => {
    navigate(`/project-details/${projectId}`);
  };

  const handleCreateProject = () => {
    navigate('/upload');
  };

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await apiService.deleteProject(projectToDelete.id || projectToDelete._id);
      setShowDeleteModal(false);
      setProjectToDelete(null);
      
      // Remove the project from the local state
      setProjects(prevProjects => 
        prevProjects.filter(p => (p.id || p._id) !== (projectToDelete.id || projectToDelete._id))
      );
      
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Fix date parsing to prevent "one day off" issue by using UTC parsing
      const date = new Date(dateString + 'T00:00:00.000Z');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return dateString;
    }
  };

  const getProjectIcon = (status) => {
    switch (status) {
      case 'In Progress':
        return '🔄';
      case 'Completed':
        return '✅';
      case 'Pending':
        return '⏳';
      default:
        return '📋';
    }
  };

  const getTabCount = (status) => {
    return projects.filter(p => p.status === status).length;
  };

  return (
    <Layout>
      <div className="dashboard-content">
        {/* Top Configuration Section */}
        <div className="config-section">
          <div className="config-row">
            <div className="config-item">
              <label>Search Projects</label>
              <input
                type="text"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="config-item">
              <label>Sort By</label>
              <select className="sort-select">
                <option value="created">Date Created</option>
                <option value="updated">Last Updated</option>
                <option value="deadline">Deadline</option>
                <option value="name">Project Name</option>
              </select>
            </div>
            <div className="config-item">
              <button onClick={handleCreateProject} className="create-btn">
                <span>+</span> Create New Project
              </button>
            </div>
          </div>
        </div>

        {/* Middle Tabs Section */}
        <div className="tabs-section">
          <div className="tabs-container">
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Projects ({projects.length})
            </button>
            <button
              className={`tab ${activeTab === 'inProgress' ? 'active' : ''}`}
              onClick={() => setActiveTab('inProgress')}
            >
              In Progress ({getTabCount('In Progress')})
            </button>
            <button
              className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({getTabCount('Completed')})
            </button>
            <button
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({getTabCount('Pending')})
            </button>
          </div>
        </div>

        {/* Bottom Content Section */}
        <div className="content-section">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredProjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-content">
                    <h2>No projects found</h2>
                    <p>
                      {searchTerm 
                        ? `No projects match "${searchTerm}". Try adjusting your search.`
                        : activeTab === 'all'
                        ? 'Get started by creating your first project and uploading documents.'
                        : `No ${activeTab} projects found.`
                      }
                    </p>
                    <button onClick={handleCreateProject} className="create-first-btn">
                      Create Your First Project
                    </button>
                  </div>
                </div>
              ) : (
                <div className="projects-list">
                  {filteredProjects.map((project) => (
                    <div key={project.id || project._id} className="project-item">
                      <div className="project-icon">
                        <span className="status-icon">{getProjectIcon(project.status)}</span>
                      </div>
                      <div className="project-details">
                        <div className="project-header">
                          <h3 className="project-name">{project.name || 'Unnamed Project'}</h3>
                          <span 
                            className="project-status"
                            style={{ color: getStatusColor(project.status) }}
                          >
                            {project.status || 'Pending'}
                          </span>
                        </div>
                        <p className="project-address">{project.address || 'No address provided'}</p>
                        <div className="project-meta">
                          <span className="project-deadline">
                            Deadline: {formatDate(project.deadline)}
                          </span>
                          <span className="project-created">
                            Created: {formatDate(project.createdAt)}
                          </span>
                        </div>
                        {project.description && (
                          <p className="project-description">{project.description}</p>
                        )}
                      </div>
                      <div className="project-actions">
                        <button 
                          onClick={() => handleViewDetails(project.id || project._id)}
                          className="view-btn"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete the project "{projectToDelete.name || 'Unnamed Project'}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={handleConfirmDelete} className="confirm-btn">Delete Project</button>
              <button onClick={handleCancelDelete} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectDashboard; 
