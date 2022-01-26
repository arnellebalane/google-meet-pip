<template>
  <div class="container">
    <button class="button"></button>
  </div>
</template>

<style scoped>
.container {
  position: relative;
}

.button {
  position: relative;
  display: block;
  width: 40px;
  height: 40px;
  padding: 8px;
  border: none;
  border-radius: 100px;

  background: var(--gm-tooltip-background-color) url('./images/icon.png') center center no-repeat;
  background-size: 24px 24px;
  cursor: pointer;
}

.button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;

  background-color: var(--mdc-ripple-color, #e8eaed);
  opacity: 0;
  transition: opacity 15ms linear;
  pointer-events: none;
}

.button:hover::before,
.button:focus::before {
  opacity: var(--mdc-ripple-hover-opacity, 0.04);
}
</style>
