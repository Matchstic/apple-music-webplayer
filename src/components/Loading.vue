<template>
  <div class="spinner-outer">
    <div class="spinner">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
        <div class="bar4"></div>
        <div class="bar5"></div>
        <div class="bar6"></div>
        <div class="bar7"></div>
        <div class="bar8"></div>
        <div class="bar9"></div>
        <div class="bar10"></div>
        <div class="bar11"></div>
        <div class="bar12"></div>
    </div>
    <p class="loading-text text-muted">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    message: String
  }
};
</script>

<style scoped>
i {
  font-size: 80px;
}

.spinner-outer {
    position: relative;
    width: 100%;
    display: block;
    top: 50%;
    transform: translateY(-50%);
}

.loading-text {
    margin: 0 auto;
    text-align: center;
    padding: 10px 0px 0px 0px;
}

.spinner {
  position: relative;
  width: 70px;
  height: 70px;
  background: transparent;
  padding: 0px;
  border-radius: 10px;
  margin: 0 auto;
}

.spinner div {
  width: 6%;
  height: 16%;
  background: #999;
  position: absolute;
  left: 32px;
  top: 30px;
  opacity: 0;
  -webkit-border-radius: 50px;
  
  -webkit-animation: fade 1s linear infinite;
}

@-webkit-keyframes fade {
  from {opacity: 1;}
  to {opacity: 0.25;}
}

.spinner div.bar1 {
  -webkit-transform:rotate(0deg) translate(0, -130%);
  -webkit-animation-delay: 0s;
}    

.spinner div.bar2 {
  -webkit-transform:rotate(30deg) translate(0, -130%); 
  -webkit-animation-delay: -0.9167s;
}

.spinner div.bar3 {
  -webkit-transform:rotate(60deg) translate(0, -130%); 
  -webkit-animation-delay: -0.833s;
}
.spinner div.bar4 {
  -webkit-transform:rotate(90deg) translate(0, -130%); 
  -webkit-animation-delay: -0.7497s;
}
.spinner div.bar5 {
  -webkit-transform:rotate(120deg) translate(0, -130%); 
  -webkit-animation-delay: -0.667s;
}
.spinner div.bar6 {
  -webkit-transform:rotate(150deg) translate(0, -130%); 
  -webkit-animation-delay: -0.5837s;
}
.spinner div.bar7 {
  -webkit-transform:rotate(180deg) translate(0, -130%); 
  -webkit-animation-delay: -0.5s;
}
.spinner div.bar8 {
  -webkit-transform:rotate(210deg) translate(0, -130%); 
  -webkit-animation-delay: -0.4167s;
}
.spinner div.bar9 {
  -webkit-transform:rotate(240deg) translate(0, -130%); 
  -webkit-animation-delay: -0.333s;
}
.spinner div.bar10 {
  -webkit-transform:rotate(270deg) translate(0, -130%); 
  -webkit-animation-delay: -0.2497s;
}
.spinner div.bar11 {
  -webkit-transform:rotate(300deg) translate(0, -130%); 
  -webkit-animation-delay: -0.167s;
}
.spinner div.bar12 {
  -webkit-transform:rotate(330deg) translate(0, -130%); 
  -webkit-animation-delay: -0.0833s;
}
</style>
