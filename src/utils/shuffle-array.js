const shuffleArray = array => {
    return array.sort(() => Math.random() - 0.5);
}

export default shuffleArray;