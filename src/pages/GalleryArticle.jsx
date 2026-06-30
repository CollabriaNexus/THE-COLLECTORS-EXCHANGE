import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GalleryArticle = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    useEffect(() => { navigate(`/archive/${slug}`, { replace: true }); }, [slug, navigate]);

    return null;
};

export default GalleryArticle;
