document.addEventListener('click', function (e) {
    // document.querySelector('a-sky').setAttribute('src', './assets/GS3.jpg');
    let newBox = document.createElement('a-box');
    // position la ou est la souris
    newBox.setAttribute('position', `{x:${e.clientX / 100}, y:${e.clientY / 100}, z:-5}`);
    newBox.setAttribute('position', `${e.clientX / 90} ${e.clientY / -200 + 3} -5`);

    newBox.setAttribute('color', 'red');
    document.querySelector('a-scene').appendChild(newBox);

    console.log(e.clientX / 100, e.clientY / 100);
}
);


