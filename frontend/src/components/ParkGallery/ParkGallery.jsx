import React, { useState } from 'react'
import styles from './ParkGallery.module.css'

const ParkGallery = ({ images, start, end }) => {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <>
      <div className={styles.gallery}>
        {images.slice(start, end).map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Imagem do parque"
            className={styles.galleryImage}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>

      {selectedImage && (
        <div
          className={styles.modal}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt=""
            className={styles.fullImage}
          />
        </div>
      )}
    </>
  )
}

export default ParkGallery