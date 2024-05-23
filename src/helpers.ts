export const getRandomNumber = (from: number, to: number) => {
    return Math.floor(Math.random() * to) + from;
};

export const getRandomColor = () => {
    const red = getRandomNumber(0, 256);
    const green = getRandomNumber(0, 256);
    const blue = getRandomNumber(0, 256);

    return `rgb(${red}, ${green}, ${blue})`;
};