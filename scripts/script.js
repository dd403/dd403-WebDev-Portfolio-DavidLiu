document.addEventListener('DOMContentLoaded', () => {
  const arrow = document.querySelector('.arrow');
  const aboutMeSection = document.querySelector('.introduction');

  arrow.addEventListener('click', () => {
    aboutMeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
// Back to top functionality
function initBackToTop() {
    const backToTopButton = document.createElement('div');
    backToTopButton.className = 'back-to-top';//use css to style this button
    document.body.appendChild(backToTopButton);//Add this <div> element to the <body> element of the webpage

    // Show button when scrolling down
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'//add smooth scrolling behavior to the scrolling
        });
    });
}


// Initialize all features when window loads
window.addEventListener('load', () => {
    // Initialize pet
    const canvas = document.getElementById('petCanvas');
    if (canvas) {
        canvas.classList.add('pet-draggable');
        const pet = new Pet(canvas);
    }

    // Initialize back to top button
    initBackToTop();
}); 

class Pet {
  constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.x = window.innerWidth / 2;
      this.y = window.innerHeight / 2;
      this.size = 40;
      this.velocity = { x: 0, y: 0 };
      this.isDragging = false;
      this.dragOffset = { x: 0, y: 0 };
      this.lastInteraction = Date.now();
      this.sprites = {
          walk: [],
          talk: [],
          smell: [],
          power: [],
          front: [],
          drag: []
      };
      this.animations = ['walk', 'talk', 'smell', 'power', 'front'];
      this.currentAnimation = 'front';
      this.frameIndex = 0;
      this.frameCount = 0;
      this.frameDelay = 3;
      this.clickTimeout = null;

      // Create pet area
      this.petArea = document.createElement('div');
      this.petArea.className = 'pet-area';
      document.body.appendChild(this.petArea);
      this.updatePetArea();

      // Load sprites
      this.loadSprites().catch(error => {
          console.error('Error loading sprites:', error);
      });

      // Set up canvas
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      // Add event listeners
      this.petArea.addEventListener('mousedown', this.startDrag.bind(this));
      document.addEventListener('mousemove', this.drag.bind(this));
      document.addEventListener('mouseup', this.endDrag.bind(this));
      this.petArea.addEventListener('click', this.handleClick.bind(this));

      // Start animation loop
      this.animate();
  }

  async loadSprites() {
      const types = ['walk', 'talk', 'smell', 'power', 'front', 'drag'];
      for (const type of types) {
          for (let i = 0; i < 10; i++) {
              const img = new Image();
              img.src = `styles/poop/poop_${type}-${i}.png`;
              try {
                  await new Promise((resolve, reject) => {
                      img.onload = resolve;
                      img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
                  });
                  this.sprites[type].push(img);
              } catch (error) {
                  console.error(`Error loading image ${img.src}:`, error);
              }
          }
      }
  }

  resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
  }

  startDrag(e) {
      e.preventDefault();
      e.stopPropagation();
      this.dragOffset.x = e.clientX - this.x;
      this.dragOffset.y = e.clientY - this.y;
      this.isDragging = true;
      this.currentAnimation = 'drag';
      this.canvas.classList.add('pet-dragging');
      
      // Clear any pending click timeout
      if (this.clickTimeout) {
          clearTimeout(this.clickTimeout);
          this.clickTimeout = null;
      }
  }

  drag(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      this.x = e.clientX - this.dragOffset.x;
      this.y = e.clientY - this.dragOffset.y;
      this.updatePetArea();
      this.lastInteraction = Date.now();
  }

  endDrag(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      this.isDragging = false;
      this.canvas.classList.remove('pet-dragging');
  }

  handleClick(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Only change form if it wasn't a drag
      if (!this.isDragging) {
          const currentIndex = this.animations.indexOf(this.currentAnimation);
          const nextIndex = (currentIndex + 1) % this.animations.length;
          this.currentAnimation = this.animations[nextIndex];
      }
  }

  updatePetArea() {
      this.petArea.style.left = (this.x - 40) + 'px';
      this.petArea.style.top = (this.y - 40) + 'px';
  }

  draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const sprite = this.sprites[this.currentAnimation][this.frameIndex];
      if (sprite) {
          this.ctx.drawImage(sprite, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
      } else {
          // Fallback drawing if sprite is not loaded
          this.ctx.beginPath();
          this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          this.ctx.fillStyle = '#FFD700';
          this.ctx.fill();
          this.ctx.stroke();
      }

      // Update frame
      this.frameCount++;
      if (this.frameCount >= this.frameDelay) {
          this.frameCount = 0;
          this.frameIndex = (this.frameIndex + 1) % (this.sprites[this.currentAnimation].length || 1);
      }
  }

  update() {
      if (!this.isDragging) {
          // Add some random movement
          this.velocity.x += (Math.random() - 0.5) * 0.5;
          this.velocity.y += (Math.random() - 0.5) * 0.5;

          // Limit velocity
          this.velocity.x = Math.max(Math.min(this.velocity.x, 2), -2);
          this.velocity.y = Math.max(Math.min(this.velocity.y, 2), -2);

          // Update position
          this.x += this.velocity.x;
          this.y += this.velocity.y;

          // Boundary check
          this.x = Math.max(this.size, Math.min(window.innerWidth - this.size, this.x));
          this.y = Math.max(this.size, Math.min(window.innerHeight - this.size, this.y));

          // Change direction if hitting boundaries
          if (this.x <= this.size || this.x >= window.innerWidth - this.size) {
              this.velocity.x *= -0.8;
          }
          if (this.y <= this.size || this.y >= window.innerHeight - this.size) {
              this.velocity.y *= -0.8;
          }

          this.updatePetArea();
      }
  }

  animate() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.animate());
  }
}

