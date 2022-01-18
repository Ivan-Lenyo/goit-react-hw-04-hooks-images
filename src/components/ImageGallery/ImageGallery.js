import { useState, useEffect } from 'react';
import s from './ImageGallery.module.css';
import PropTypes from 'prop-types';
import pixabayApi from '../../services/pixabayApi';
import ImageGalleryItem from '../ImageGalleryItem';
import Button from '../Button';
import Modal from '../Modal';
import Spiner from '../Loader';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export default function ImageGallery({ imageName, pageScroll }) {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(Status.IDLE);
  const [showModal, setShowModal] = useState(false);
  const [largeImg, setLargeImg] = useState('');

  useEffect(() => {
    if (!imageName) {
      return;
    }
    setStatus(Status.PENDING);

    pixabayApi
      .fetchImage(imageName, page)
      .then(data => {
        if (data.hits.length > 0) {
          setImages(data.hits);
          setStatus(Status.RESOLVED);
        } else {
          setStatus(Status.REJECTED);
        }
      })
      .catch(error => {
        setError(error);
        setStatus(Status.REJECTED);
      });
  }, [imageName]);

  useEffect(() => {
    if (page !== 1) {
      setLoading(true);

      pixabayApi
        .fetchImage(imageName, page)
        .then(data => {
          setImages([...images, ...data.hits]);
          setStatus(Status.RESOLVED);
          pageScroll();
        })
        .catch(() => setStatus(Status.REJECTED))
        .finally(() => setLoading(false));
    }
  }, [page]);

  const handleClickButton = () => {
    setPage(page + 1);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const onImageClick = largeImageURL => {
    setLargeImg(largeImageURL);
    toggleModal();
  };

  if (status === 'idle') {
    return <h2 className={s.Title}>Waiting for search name</h2>;
  }

  if (status === 'pending') {
    return <Spiner />;
  }

  if (status === 'rejected') {
    return <h2 className={s.Title}>Something was wrong please try again!</h2>;
  }

  if (status === 'resolved') {
    return (
      <>
        <ul className={s.ImageGallery}>
          {images.map(image => {
            return (
              <ImageGalleryItem
                key={image.id}
                image={image}
                onImageClick={onImageClick}
              />
            );
          })}
        </ul>
        {loading && <Spiner />}
        {images.length >= 12 && (
          <Button handleClickButton={handleClickButton} />
        )}
        {showModal && (
          <Modal toggleModal={toggleModal} largeImg={largeImg}></Modal>
        )}
      </>
    );
  }
}

ImageGallery.propTypes = {
  imageName: PropTypes.string,
  pageScroll: PropTypes.func,
};
