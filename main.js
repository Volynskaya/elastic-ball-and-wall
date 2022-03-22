window.addEventListener("load",main,false);

function main() {
	let ctx	= example.getContext("2d");

	let	N;
	let	Radius;

	let period = Math.sqrt(k);
	let	dt = 0.01; 

	let	F_x = [];
	let	F_y = [];

	let F_pres_x = [];
	let	F_pres_y = [];

	let v_y  = [];
	let v_x  = [];

	let	x = [];
	let	y = [];

	let l = 0;

	let phi;

	let s0;
	
	function init() {
		if (timer!=0) {clearInterval(timer)};
		
		x.length=0;
		y.length=0;
		v_x.length=0;
		v_y.length=0;
		F_x.length=0;
		F_y.length=0;
		F_pres_x.length=0;
		F_pres_y.length=0;
		
		N = document.getElementById("NumberElements").value;
		Radius = document.getElementById("R").value;
		Vx0 = document.getElementById("Vx00").value;
		Vy0 = document.getElementById("Vy00").value;
		k = document.getElementById("k").value;
		
		Vx0 = -Vx0/10;
		Vy0 = Vy0/10;
		phi = 2 * Math.PI / N;

		for (let i = 0; i < N; i++) {
			x.push(Radius * Math.cos(phi * i));
			y.push(Radius * Math.sin(phi * i));
			v_y.push(Vy0);
			v_x.push(Vx0);
			F_pres_x.push(0);
			F_pres_y.push(0);
		}

		l = Math.sqrt(Math.pow((x[1] - x[0]),2) + Math.pow((y[1] - y[0]),2));
		s0 = Square();
	}

	function Elastic_forces(k1, k2, k3) {
		let	dl_right;
		let	dl_left;
		let	F_l_y;
		let	F_r_y;

		let	F_l_x;
		let	F_r_x;

		let	cos_l;
		let	cos_r;
		let	sin_l;
		let	sin_r;

		dl_left	= Math.sqrt(Math.pow((x[k2] - x[k1]),2) + Math.pow((y[k2] - y[k1]),2));
		dl_right= Math.sqrt(Math.pow((x[k3] - x[k2]),2) + Math.pow((y[k3] - y[k2]),2));

		cos_l 	= ((y[k2] - y[k1])) / dl_left;
		sin_l 	= ((x[k2] - x[k1])) / dl_left;
		F_l_y 	= -k * (dl_left - l) * cos_l;
		F_l_x 	= -k * (dl_left - l) * sin_l;

		cos_r 	= ((y[k3] - y[k2])) / dl_right;
		sin_r 	= ((x[k3] - x[k2])) / dl_right;
		F_r_y 	= -k * (dl_right - l) * cos_r;
		F_r_x 	= -k * (dl_right - l) * sin_r;

		return [F_l_x, F_l_y, F_r_x, F_r_y];
	}

	function Square() {
		let S1 = 0;
		let S2 = 0;

		for (let i = 0; i < N - 1; i++) {
			S1 += x[i] * y[i+1];
		}

		for (let i = 0; i < N - 1; i++) {
			S2 += x[i+1] * y[i];
		}

		return 1/2 * Math.abs(S1 + x[N-1] * y[0] - S2 - x[0] * y[N-1]);
	}

	function Pressure_v2() {
		let k_pres = -0.005;

		let sq = Square();
		let length;
		let normal_x;
		let normal_y;

		let pressureConst = k_pres * (sq / s0 - 1);

		for (let i = 1; i < N; i++) {
			length = Math.sqrt(Math.pow((x[i-1] - x[i]), 2) + Math.pow((y[i-1] - y[i]), 2));

			normal_x = -(y[i-1] - y[i]) / length;
			console.log(normal_x);
			normal_y = (x[i-1] - x[i]) / length;

			F_pres_x[i] += k_pres * (sq / s0 - 1) * normal_x;
			F_pres_y[i] += k_pres * (sq / s0 - 1) * normal_y;
			F_pres_x[i-1] += k_pres * (sq / s0 - 1) * normal_x;
			F_pres_y[i-1] += k_pres * (sq / s0 - 1) * normal_y;
		}

		length = Math.sqrt(Math.pow((x[N-1] - x[0]), 2) + Math.pow((y[N-1] - y[0]), 2));

		normal_x = -(y[N-1] - y[0]) / length;
		normal_y = (x[N-1] - x[0]) / length;

		F_pres_x[N-1] += k_pres * (sq / s0 - 1) * normal_x;
		F_pres_y[N-1] += k_pres * (sq / s0 - 1) * normal_y;
		F_pres_x[0] += k_pres * (sq / s0 - 1) * normal_x;
		F_pres_y[0] += k_pres * (sq / s0 - 1) * normal_y;
	}

	function physics() {
		let F_elast = [];
		let g = 9;

		F_elast[0] = Elastic_forces(N-1, 0, 1);
		for (let i = 1; i < N - 1; i++) {
			F_elast[i] = Elastic_forces(i-1, i, i+1);
		}
		F_elast[N-1] = Elastic_forces(N - 2, N - 1, 0);

		Pressure_v2();

		for (let i = 0; i < N; i++) {
			F_y[i] = -F_elast[i][3] + F_elast[i][1] + F_pres_y[i] + LennardJhones(-g - y[i]);
			F_x[i] = F_elast[i][0] - F_elast[i][2] + F_pres_x[i] + LennardJhones(-g - x[i]);

			v_y[i] += F_y[i] * dt;
			y[i] += v_y[i] * dt;
			v_x[i] += F_x[i] * dt;
			x[i] += v_x[i] * dt;
		}
	}

	function LennardJhones(r) {
		let sigma 	= 0.2;
		let epsilon = 0.5;
		return 4 * epsilon * ((sigma / r) ** 12 - (sigma / r) ** 6);
	}

	function draw() {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.rect(0, 0, 500, 500);
		ctx.fill();

		for (let i = 0; i < N; i++) {
			ctx.beginPath();
			ctx.fillStyle = 'black';
			ctx.arc(200 + x[i] * 20, 200 + y[i] * 20, 2.5, 0, 2*Math.PI);
			ctx.fill();
		}

		for (let i = 0; i < N-1; i++) {
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.moveTo(200 + x[i] * 20, 200 + y[i] * 20);
			ctx.lineTo(200 + x[i+1] * 20, 200 + y[i+1] * 20);
			ctx.stroke();
		}
		
		
		ctx.beginPath();
		ctx.moveTo(200 + x[N-1] * 20, 200 + y[N-1] * 20);
		ctx.lineTo(200 + x[0] * 20, 200 + y[0] * 20);
		ctx.stroke();
		
		
		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.moveTo(20, 0);
		ctx.lineTo(20, 880);
		ctx.stroke();

		physics();
	} 

	let timer;
	
	function drawOnClick() {
		init();
		timer = setInterval(draw, 1);
	}

	let startButton = document.getElementById("StartButton");

	startButton.onclick = drawOnClick;

	function clearOnClick() {
		clearInterval(timer);	
		x = [];
		y = [];
		v_x = [];
		v_y = [];
		N = 0;
		F_pres_x = [];
		F_pres_y = [];

		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.rect(0, 0, 400, 400);
		ctx.fill();
	}

	clearButton.onclick = clearOnClick;
}




