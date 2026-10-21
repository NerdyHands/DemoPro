import React, { useState, useRef } from 'react';
import './ImageDropzone.css';

const ImageDropzone = ({ images = [], onImagesChange, maxImages = 10 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset file input
    e.target.value = '';
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }

    if (images.length + imageFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Some files are too large. Maximum file size is 10MB.');
      return;
    }

    // Create preview URLs and prepare images
    const newImages = imageFiles.map((file, index) => {
      const preview = URL.createObjectURL(file);
      return {
        file,
        preview,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        order: images.length + index,
        isNew: true
      };
    });

    onImagesChange([...images, ...newImages]);
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    // Update order
    newImages.forEach((img, i) => {
      img.order = i;
    });
    onImagesChange(newImages);
  };

  const handleReorder = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    // Update order
    newImages.forEach((img, i) => {
      img.order = i;
    });

    onImagesChange(newImages);
  };

  const handleImageDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleImageDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    handleReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="image-dropzone-container">
      {/* Upload Area */}
      <div
        className={`dropzone-area ${isDragging ? 'dragging' : ''} ${images.length >= maxImages ? 'disabled' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => images.length < maxImages && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="dropzone-content">
          <span className="dropzone-icon">📷</span>
          <p className="dropzone-text">
            {images.length >= maxImages ? (
              `Maximum ${maxImages} images reached`
            ) : (
              <>
                <strong>Drop images here</strong> or click to browse
              </>
            )}
          </p>
          <p className="dropzone-hint">
            {images.length < maxImages && (
              <>Supports: JPG, PNG, GIF, WebP • Max 10MB per file • {maxImages - images.length} more allowed</>
            )}
          </p>
        </div>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="images-gallery">
          <div className="gallery-header">
            <span>{images.length} {images.length === 1 ? 'photo' : 'photos'}</span>
            <span className="drag-hint">💡 Drag to reorder</span>
          </div>
          
          <div className="gallery-grid">
            {images.map((image, index) => (
              <div
                key={index}
                className={`gallery-item ${draggedIndex === index ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
              >
                <div className="image-number">{index + 1}</div>
                <img
                  src={image.preview || image.gcsUrl}
                  alt={image.originalName || `Image ${index + 1}`}
                  className="gallery-image"
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="btn-remove"
                    title="Remove image"
                  >
                    🗑️
                  </button>
                </div>
                <div className="image-info">
                  <span className="image-name">{image.originalName || 'Image'}</span>
                  {image.size && (
                    <span className="image-size">
                      {(image.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;

