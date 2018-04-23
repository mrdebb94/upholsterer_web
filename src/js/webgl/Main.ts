import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Scene2D } from './Scene2D';
import { Scene3D } from './Scene3D';
import { Subscription } from 'rxjs/Subscription';

import { Scene } from './Scene';

interface ClickCallback {
	(x, y): void;
}

export class Main {

	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private scene: Scene;
	private sceneSubscription: Subscription;

	private shaderProgram;

	private programInfo;

	constructor(htmlCanvasElementId: string, vertexShaderSource: string,
		fragmentShaderSource: string) {

		this.canvas = document.querySelector(htmlCanvasElementId);
		this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;

		if (!this.gl) {
			alert('Unable to initialize WebGL. Your browser or machine may not support it.');
			return;
		}

		this.initShaderProgram(vertexShaderSource, fragmentShaderSource);

		this.programInfo = {
			program: this.shaderProgram,
			attribLocations: {
				vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
				vertexColor: this.gl.getAttribLocation(this.shaderProgram, 'aVertexColor')
			},
			uniformLocations: {
				projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
				modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
			},
		};

	}

	setScene = (scene: Scene) => {
		if (this.scene) {
			this.sceneSubscription.unsubscribe();
		}
		this.scene = scene;
		this.sceneSubscription = this.scene.roomSource$.subscribe(
			() => {
				console.log("Itt");
				this.drawScene();
			}
		)
	};

	//TODO: szín legyen opcionális
	initBuffers(positions, colors) {

		const positionBuffer = this.gl.createBuffer();


		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

		this.gl.bufferData(this.gl.ARRAY_BUFFER,
			new Float32Array(positions),
			this.gl.STATIC_DRAW);


		const colorBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);

		return {
			position: positionBuffer,
			color: colorBuffer
		};
	}

	drawScene(scene?: Scene) {

		if (!scene) {
			scene = this.scene;
		}

		//TODO: new color
		//this.gl.clearColor(0, 0, 255, 0.3);
		this.gl.clearColor(1, 1, 1, 0.9);
		//this.gl.clearColor(247 / 255, 244 / 255, 244 / 255, 0.9);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);


		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		/*var colors = [];
		var vertices = [];
		for (var i = 0; i < 2000; i = i + 50) {
			//függőleges
			colors = colors.concat([0, 0, 0, 0.0]);



			let v = scene.convert2DPointTo3DWorld(i, 0);
			vertices = vertices.concat([v[0], v[1], v[2]]);

			v = scene.convert2DPointTo3DWorld(i, 800);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			//vízszintes
			colors = colors.concat([0, 0, 0, 0.0]);



			v = scene.convert2DPointTo3DWorld(0, i);
			vertices = vertices.concat([v[0], v[1], v[2]]);

			v = scene.convert2DPointTo3DWorld(1000, i);
			vertices = vertices.concat([v[0], v[1], v[2]]);


		}*/

		let grid = scene.getGrid();

		if (grid) {

			let buffers = this.initBuffers(grid[0], grid[1]);

			{
				const numComponents = 3;
				const type = this.gl.FLOAT;
				const normalize = false;
				const stride = 0;
				const offset = 0;

				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
				this.gl.vertexAttribPointer(
					this.programInfo.attribLocations.vertexPosition,
					numComponents,
					type,
					normalize,
					stride,
					offset);
				this.gl.enableVertexAttribArray(
					this.programInfo.attribLocations.vertexPosition);
			}

			{
				const numComponents = 4;
				const type = this.gl.FLOAT;
				const normalize = false;
				const stride = 0;
				const offset = 0;
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
				this.gl.vertexAttribPointer(
					this.programInfo.attribLocations.vertexColor,
					numComponents,
					type,
					normalize,
					stride,
					offset);
				this.gl.enableVertexAttribArray(
					this.programInfo.attribLocations.vertexColor);
			}


			//TODO: useProgram-t nem biztos, hogy mindig meg kellene hívni
			this.gl.useProgram(this.programInfo.program);

			this.gl.uniformMatrix4fv(
				this.programInfo.uniformLocations.projectionMatrix,
				false,
				scene.projectionMatrix);
			this.gl.uniformMatrix4fv(
				this.programInfo.uniformLocations.modelViewMatrix,
				false,
				scene.modelViewMatrix);


			//this.gl.drawArrays(this.gl.LINES, 0, grid[1].length / 4);

			this.gl.drawArrays(this.gl.LINES, 0, grid[0].length/3);

		}


		// look up the text canvas.
		let textCanvas: HTMLCanvasElement = document.getElementById("text") as HTMLCanvasElement;

		// make a 2D context for it
		var ctx = textCanvas.getContext("2d");

		ctx.font = "15px Arial";
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		console.log("Meret " + ctx.canvas.width + " " + ctx.canvas.height);
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


		for (let i = 0; i < scene.rooms.length; i++) {

			let screenPointFrom = scene.convert3DPointToScreen(
				vec4.fromValues(scene.rooms[i].squares[0].leftUpperCoordinate[0], scene.rooms[i].squares[0].leftUpperCoordinate[1]
					, scene.rooms[i].squares[0].leftUpperCoordinate[2], 1.0));

			let screenPointTo = scene.convert3DPointToScreen(
				vec4.fromValues(scene.rooms[i].squares[0].rightLowerCoordinate[0], scene.rooms[i].squares[0].rightLowerCoordinate[1]
					, scene.rooms[i].squares[0].rightLowerCoordinate[2], 1.0));
			console.log("E " + screenPointFrom[0] + " " + screenPointFrom[1]);
			ctx.font = (10*scene.rooms[i].height)+"px Arial";
			
			ctx.fillText(scene.rooms[i].roomName + "", (screenPointFrom[0] + screenPointTo[0]) / 2, (screenPointFrom[1] + screenPointTo[1]) /2.4);
			
			ctx.fillText(scene.rooms[i].squareMeter+" m2 ",(screenPointFrom[0] + screenPointTo[0]) / 2, (screenPointFrom[1] + screenPointTo[1]) / 1.70);

			for (let j = 0; j < scene.rooms[i].squares.length; j++) {
				for (let k = 0; k < scene.rooms[i].squares[j].triangles.length; k++) {

					let buffers = this.initBuffers(scene.rooms[i].squares[j].triangles[k].getVerticesArray(), scene.rooms[i].squares[j].triangles[k].getColorArray());

					{
						const numComponents = 3;
						const type = this.gl.FLOAT;
						const normalize = false;
						const stride = 0;
						const offset = 0;

						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
						this.gl.vertexAttribPointer(
							this.programInfo.attribLocations.vertexPosition,
							numComponents,
							type,
							normalize,
							stride,
							offset);
						this.gl.enableVertexAttribArray(
							this.programInfo.attribLocations.vertexPosition);
					}

					{
						const numComponents = 4;
						const type = this.gl.FLOAT;
						const normalize = false;
						const stride = 0;
						const offset = 0;
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
						this.gl.vertexAttribPointer(
							this.programInfo.attribLocations.vertexColor,
							numComponents,
							type,
							normalize,
							stride,
							offset);
						this.gl.enableVertexAttribArray(
							this.programInfo.attribLocations.vertexColor);
					}

					this.gl.useProgram(this.programInfo.program);

					this.gl.uniformMatrix4fv(
						this.programInfo.uniformLocations.projectionMatrix,
						false,
						scene.projectionMatrix);
					this.gl.uniformMatrix4fv(
						this.programInfo.uniformLocations.modelViewMatrix,
						false,
						scene.modelViewMatrix);

					{
						const offset = 0;
						let vertexCount = scene.vertexCount;
						this.gl.drawArrays(this.gl.TRIANGLES, offset, vertexCount);
					}

				}
			}
		}

		for (let k = 0; k < scene.triangles.length; k++) {

			let buffers = this.initBuffers(scene.triangles[k].getVerticesArray(), scene.triangles[k].getColorArray());

			{
				const numComponents = 3;
				const type = this.gl.FLOAT;
				const normalize = false;
				const stride = 0;
				const offset = 0;

				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
				this.gl.vertexAttribPointer(
					this.programInfo.attribLocations.vertexPosition,
					numComponents,
					type,
					normalize,
					stride,
					offset);
				this.gl.enableVertexAttribArray(
					this.programInfo.attribLocations.vertexPosition);
			}

			{
				const numComponents = 4;
				const type = this.gl.FLOAT;
				const normalize = false;
				const stride = 0;
				const offset = 0;
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
				this.gl.vertexAttribPointer(
					this.programInfo.attribLocations.vertexColor,
					numComponents,
					type,
					normalize,
					stride,
					offset);
				this.gl.enableVertexAttribArray(
					this.programInfo.attribLocations.vertexColor);
			}

			this.gl.useProgram(this.programInfo.program);

			this.gl.uniformMatrix4fv(
				this.programInfo.uniformLocations.projectionMatrix,
				false,
				scene.projectionMatrix);
			this.gl.uniformMatrix4fv(
				this.programInfo.uniformLocations.modelViewMatrix,
				false,
				scene.modelViewMatrix);

			{
				const offset = 0;
				let vertexCount = scene.vertexCount;
				this.gl.drawArrays(this.gl.TRIANGLES, offset, vertexCount);
			}

			//rács rajzolás

		}

	}


	initShaderProgram(vsSource: string, fsSource: string): void {
		const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
		const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);


		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			alert('Unable to initialize the shader program: ' +
				this.gl.getProgramInfoLog(this.shaderProgram));
			return null;
		}

	}

	loadShader(type, source): any {
		const shader = this.gl.createShader(type);


		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);


		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
			this.gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	subscribeClick(clickCallback: ClickCallback): void {
		this.canvas.addEventListener("click", (event) => {
			var rect = this.canvas.getBoundingClientRect();
			let x = event.clientX - rect.left;
			let y = event.clientY - rect.top;

			clickCallback(x, y);
		}, false);
	}
	/*
	drawGrids() {
		var vertices = [
			-0.7, -0.1, 0,
			-0.3, 0.6, 0,
			-0.3, -0.3, 0,
			0.2, 0.6, 0,
			0.3, -0.3, 0,
			0.7, 0.6, 0
		]
		const positionBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

		// Get the attribute location
		var coord = this.gl.getAttribLocation(this.shaderProgram, "coordinates");

		// Point an attribute to the currently bound VBO
		this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);

		// Enable the attribute
		this.gl.enableVertexAttribArray(coord);

	

		// Clear the canvas
		//this.gl.clearColor(0.5, 0.5, 0.5, 0.9);
		this.gl.clearColor(247/255, 244/255, 244/255, 0.9);
		// Enable the depth test
		this.gl.enable(this.gl.DEPTH_TEST);

		// Clear the color and depth buffer
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Set the view port
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		// Draw the triangle
		this.gl.drawArrays(this.gl.LINES, 0, 6);
	}
     */
}