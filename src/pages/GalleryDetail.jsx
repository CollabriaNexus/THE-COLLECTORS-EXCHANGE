import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GalleryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Map old gallery item IDs to blog slugs
        const slugMap = {
            'kohinoor-history': 'the-koh-i-noor-diamond',
            'faberge-eggs': 'the-imperial-faberge-eggs',
            'tipu-sultan-tiger': 'tipus-tiger',
            'rosseta-stone': 'the-rosetta-stone',
        };
        const slug = slugMap[id] || '';
        navigate(slug ? `/archive/${slug}` : '/archive', { replace: true });
    }, [id, navigate]);

    return null;
};

export default GalleryDetail;
