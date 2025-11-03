const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#key-features');
const btnScrollTo1 = document.querySelector('.form-check-label lawnlabel');
const section2 = document.querySelector('.residentialOptions');

// Button scrolling
btnScrollTo.addEventListener('click', function (e) {
  const s1coords = section1.getBoundingClientRect();
  console.log(s1coords);

  console.log(e.target.getBoundingClientRect());

  console.log('Current scroll (X/Y)', window.pageXOffset, window.pageYOffset);

  console.log(
    'height/width viewport',
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  );
  section1.scrollIntoView({ behavior: 'smooth' });
});

// Button scrolling
btnScrollTo1.addEventListener('click', function (e) {
    const s1coords = section1.getBoundingClientRect();
    console.log(s1coords);
  
    console.log(e.target.getBoundingClientRect());
  
    console.log('Current scroll (X/Y)', window.pageXOffset, window.pageYOffset);
  
    console.log(
      'height/width viewport',
      document.documentElement.clientHeight,
      document.documentElement.clientWidth
    );
    section2.scrollIntoView({ behavior: 'smooth' });
  });

