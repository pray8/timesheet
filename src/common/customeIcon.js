import React from 'react';
import PropTypes from 'prop-types';

// Define the CustomIcon component
const CustomIcon = ({ src, alt, width, height }) => (
    <img
        src={src}        // Source of the image
        alt={alt}        // Alt text for the image
        width={width}    // Width of the image
        height={height}  // Height of the image
        style={{ display: 'block', objectFit: 'contain' }} // Optional styles
    />
);

// Define prop types for the component
CustomIcon.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
};

// Set default props
CustomIcon.defaultProps = {
    width: 24,
    height: 24,
};

export default CustomIcon;
