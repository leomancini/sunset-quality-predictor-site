function getOffset(element) {
    const boundingBox = element.getBoundingClientRect();

    return {
        left: boundingBox.left + window.scrollX,
        top: boundingBox.top + window.scrollY
    };
}