import utils from './utils'
import gsap from "gsap";

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreElement = document.querySelector('#scoreElement')
const startGameButton = document.querySelector('#startGameButton')
const modalElement = document.querySelector('#modalElement')
const bigScoreElement = document.querySelector('#bigScoreElement')

addEventListener('resize', () =>{
  canvas.width = innerWidth
  canvas.height = innerHeight
  player.x = canvas.width / 2
  player.y = canvas.height / 2
})

addEventListener('click', (event) => {

  const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4
  }
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 2, 'red', velocity)
  )
})

startGameButton.addEventListener('click', () =>{
  init()
  spawnEnemies()
  animate()
  modalElement.style.display = 'none'
})

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
    c.fillStyle = this.color
    c.fill()
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const friction = 0.99

class Particle {
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

const x = canvas.width / 2
const y = canvas.height / 2

function spawnEnemies() {
  setInterval( () =>{
    const radius = Math.random() * (30 - 4) + 4

    let x 
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius 
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius 
    }
    
    const color = `hsl(${Math.floor(Math.random() * 360 + 1)}, 50%, 50%)`
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    const velocity = {
      x: Math.cos(angle) * 2,
      y: Math.sin(angle) * 2
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1500)
}




let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
  player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white')
  projectiles = []
  enemies = []
  particles = []
  score = 0
  scoreElement.innerHTML = 0
  bigScoreElement.innerHTML = 0
}
  
let animationId
let score = 0 

function animate() {

  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.15)'
  c.fillRect(0,0, canvas.width, canvas.height)
  player.draw()
  
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0){
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  })

  projectiles.forEach((projectile, index) => {
    projectile.update()

    if (projectile.x + projectile.radius < 0 || projectiles.x - projectiles.radius > canvas.width || projectile.y + projectile.radius < 0 || projectiles.y - projectiles.radius > canvas.height) {
      projectiles.splice(index, 1)
    }
  }) 
    
  enemies.forEach((enemy, index) =>{
    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    if (dist - enemy.radius - player.radius < 1) {
      setTimeout(() => {
        cancelAnimationFrame(animationId)
        modalElement.style.display = 'flex'
        bigScoreElement.innerHTML = score
      }, 0)
    }
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      if (dist - enemy.radius - projectile.radius < 1) {


        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) *(Math.random() * 4), y: (Math.random() - 0.5) * (Math.random() * 4) }))
        }

        if (enemy.radius - 10 > 5) {

          score += 100
          scoreElement.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius -10
          })
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1)
          }, 0)
        } else {
          score += 250
          scoreElement.innerHTML = score
          setTimeout(() => {
            enemies.splice(index, 1)
            projectiles.splice(projectileIndex, 1)
          }, 0)
        }
        }
        
    })
  })

}
