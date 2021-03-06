import { Main } from './webgl/Main';
import { Scene2D } from './webgl/Scene2D';
import { Scene3D } from './webgl/Scene3D';
import { Triangle } from './webgl/Triangle';
import { Square } from './webgl/Square';
import { Room } from './webgl/Room';
import { Camera } from './webgl/Camera';

import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Wall } from './webgl/Wall';
let scene2D = new Scene2D(1000, 800, 45, 0.1, 100, -5, true);
let scene3D = new Scene3D(1000, 800, 45, 0.1, 100, 0, true);
let main = new Main('#glcanvas');
let points: vec3[] = [];
let indexRemoveRoom = -1;
let clickedX;
let clickedY;

let selectedWall:Wall;

/* yaw is initialized to -90.0 degrees since a yaw of 0.0 results 
   in a direction vector pointing to the right so we initially rotate a bit to the left.
*/
let yaw: number = -90.0;
let pitch: number = 0.0;

let isIn2DMode: boolean = true;
let isIn3DMode: boolean = false;

let camera: Camera = new Camera(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, 1, 0));

//scene3D.lookAt(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, 1, 0));
main.setScene(scene2D);

main.onDragging().subscribe(({ prevPos, currentPos }) => {
	if (isIn3DMode && currentPos) {
		let xoffset = currentPos.x - prevPos.x;
		let yoffset = prevPos.y - currentPos.y;

		let sensitivity = 0.05;
		xoffset *= sensitivity;
		yoffset *= sensitivity;

		yaw += xoffset;
		pitch += yoffset;

		if (pitch > 89.0) {
			pitch = 89.0;
		}
		if (pitch < -89.0) {
			pitch = -89.0;
		}

		camera.rotate(yaw, pitch);
		main.drawScene();
	}
});

document.addEventListener('keydown',
	function press(e) {
		//event.preventDefault();
		//WASD control
		if (e.keyCode === 87 /* w */) {

		}

		if (e.keyCode === 68 /* d */) {

		}

		if (e.keyCode === 83 /* s */) {

		}

		if (e.keyCode === 65 /* a */) {

		}

		//arrows control
		if (e.keyCode === 38 /* up */ || e.keyCode === 90 /* z */) {
			camera.pedestal(0.001);
			main.drawScene();
		}
		if (e.keyCode === 39 /* right */) {
		}
		if (e.keyCode === 40 /* down */) {
			camera.pedestal(-0.001);
			main.drawScene();
		}
		if (e.keyCode === 37 /* left */ || e.keyCode === 81 /* q */) {

		}
	});

main.drawScene();
let select2D = (<HTMLInputElement>document.getElementById("2d"));
let select3D = (<HTMLInputElement>document.getElementById("3d"));
select2D.addEventListener("click", (event) => {
	isIn2DMode = true;
	isIn3DMode = false;
	main.setScene(scene2D);
	main.drawScene();
});
select3D.addEventListener("click", (event) => {
	isIn2DMode = false;
	isIn3DMode = true;
	let rooms:Room[] = scene2D.getRooms();
	scene3D.setRooms(rooms);
	scene3D.setCamera(camera);
	main.setScene(scene3D);
	main.drawScene();
});
let addNewRoomHTMLInput = (<HTMLInputElement>document.getElementById("addNewRoom"));
let removeRoomHTMLInput = (<HTMLInputElement>document.getElementById("removeRoom"));
let addDoorHTMLInput = (<HTMLInputElement>document.getElementById("addDoor"));
let removeDoorHTMLInput = (<HTMLInputElement>document.getElementById("removeDoor"));
let addWindowHTMLInput = (<HTMLInputElement>document.getElementById("addWindow"));
let removeWindowHTMLInput = (<HTMLInputElement>document.getElementById("removeWindow"));
let textureHTMLInput = (<HTMLInputElement>document.getElementById("texture"));
//the event listener of the adding new room
/*
The user give the left upper coordinates (roomUpperLeftX, roomUpperLeftY)
the height and width of the room (in square meter - so in grid - grid is the unit)
the name of the room
the border width of the room
*/
addNewRoomHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	//the  x component of the left upper coordinate of the room
	let roomUpperLeftX: number = parseInt((<HTMLInputElement>document.getElementById("roomUpperLeftX")).value);
	//the y component of the left upper coordinate of the room
	let roomUpperLeftY: number = parseInt((<HTMLInputElement>document.getElementById("roomUpperLeftY")).value);
	//the width of the room
	let roomWidth: number = parseInt((<HTMLInputElement>document.getElementById("roomWidth")).value);
	//the height of the room
	let roomHeight: number = parseInt((<HTMLInputElement>document.getElementById("roomHeight")).value);
	//the name of the room
	let roomName: string = (<HTMLInputElement>document.getElementById("roomName")).value;
	//the border of the room
	let roomBorder: number = Number((<HTMLInputElement>document.getElementById("roomBorder")).value);
	let roomWidthSquareM = roomWidth;
	let roomHeightSquareM = roomHeight;
	let roomUpperLeftXSquareM = roomUpperLeftX;
	let roomUpperLeftYSquareM = roomUpperLeftY;
	let roomBorderSquareM = roomBorder;
	let roomMValues = [roomUpperLeftXSquareM, roomUpperLeftYSquareM, roomWidthSquareM, roomHeightSquareM, roomBorderSquareM];
	//the calculation of the properties of the room in square meter
	//the calculation of the room width to square meter
	roomWidth = roomWidth * 50 - 4 * Math.sqrt(4 * roomBorder * roomBorder) * 50;
	//the calculation of the room height to square meter
	roomHeight = roomHeight * 50 - 4 * Math.sqrt(4 * roomBorder * roomBorder) * 50;
	//the upper left x coordinate of the room
	roomUpperLeftX = (roomUpperLeftX) * 50 + 2 * Math.sqrt(4 * roomBorder * roomBorder) * 50;
	//the upper right y coordinate of the room
	roomUpperLeftY = (roomUpperLeftY) * 50 + 2 * Math.sqrt(4 * roomBorder * roomBorder) * 50;
	let square = new Square();
	square.createFromVec(
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX + roomWidth, roomUpperLeftY),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY + roomHeight),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX + roomWidth, roomUpperLeftY + roomHeight),
		vec4.fromValues(192, 192, 192, 1.0)
	);
	//we determine if the room (which would be created by the user) can be created (if any of the existing room contains this room, the room cannot be created)
	let indexOfActualRoom = new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues).contains(scene2D.getRooms());
	//the room can be created
	if (indexOfActualRoom == -1 && indexRemoveRoom == -1) {
		scene2D.addRoom(new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues),
	 selectedWall);
	 console.log(scene2D.getWallGeometries());
	} else {
		//the room is exists, we would like to delete or modify the room
		if (indexRemoveRoom != -1) {
			let removedRoom = new Room(scene2D.getRooms()[indexRemoveRoom].getBasicSquare(), scene2D.getRooms()[indexRemoveRoom].getRoomBorder(), scene2D.getRooms()[indexRemoveRoom].getRoomName() + "", scene2D.getRooms()[indexRemoveRoom].getWidth(), scene2D.getRooms()[indexRemoveRoom].getHeight(), scene2D.getRooms()[indexRemoveRoom].getSquareMeter(), scene2D.getRooms()[indexRemoveRoom].getRoomMValues());
			removedRoom.setRoomDoors(scene2D.getRooms()[indexRemoveRoom].getRoomDoors());
			removedRoom.setRoomWindows(scene2D.getRooms()[indexRemoveRoom].getRoomWindows());
			scene2D.removeRoom(indexRemoveRoom);
			let indexOfActualRoom2 = new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues).contains(scene2D.getRooms());
			if (indexOfActualRoom2 == -1) {
				scene2D.addRoom(new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues));
			} else {
				scene2D.addRoom(removedRoom);
			}
		}
	}
	//if we created the room we remove the values in the form
	(<HTMLInputElement>document.getElementById("roomUpperLeftX")).value = "";
	(<HTMLInputElement>document.getElementById("roomUpperLeftY")).value = "";
	(<HTMLInputElement>document.getElementById("roomWidth")).value = "";
	(<HTMLInputElement>document.getElementById("roomHeight")).value = "";
	(<HTMLInputElement>document.getElementById("roomName")).value = "";
	(<HTMLInputElement>document.getElementById("roomBorder")).value = "";
	indexRemoveRoom = -1;
});
textureHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	let textureOptions = (<HTMLInputElement>document.getElementById("textureOptions")).value;
	main.texture2D(textureOptions, indexRemoveRoom);
});
//the room remove event listener
removeRoomHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	//if the room exists
	if (indexRemoveRoom != -1) {
		//remove the room
		scene2D.removeRoom(indexRemoveRoom);
		//reset the form
		(<HTMLInputElement>document.getElementById("roomUpperLeftX")).value = "";
		(<HTMLInputElement>document.getElementById("roomUpperLeftY")).value = "";
		(<HTMLInputElement>document.getElementById("roomWidth")).value = "";
		(<HTMLInputElement>document.getElementById("roomHeight")).value = "";
		(<HTMLInputElement>document.getElementById("roomName")).value = "";
		(<HTMLInputElement>document.getElementById("roomBorder")).value = "";
	}
});
//the door remove event listener
removeDoorHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	//if the room exists
	if (indexRemoveRoom != -1) {
		//remove the door
		let direction = (<HTMLInputElement>document.getElementById("doorOptions")).value;
		scene2D.getRooms()[indexRemoveRoom].removeDoor(direction, 0.1, clickedX, clickedY);
		main.drawScene(scene2D);
	}
});
//the door add event listener
addDoorHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	//if the room exists
	if (indexRemoveRoom != -1) {
		//add the door to the room
		let direction = (<HTMLInputElement>document.getElementById("doorOptions")).value;
		scene2D.getRooms()[indexRemoveRoom].addDoor(direction, 0.1, clickedX, clickedY);
		main.drawScene(scene2D);
	}
});
//the remove windows from door event listener
removeWindowHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	//if the room exists
	if (indexRemoveRoom != -1) {
		//remove the door
		let direction = (<HTMLInputElement>document.getElementById("doorOptions")).value;
		scene2D.getRooms()[indexRemoveRoom].removeWindow(direction, 0.1, clickedX, clickedY);
		main.drawScene(scene2D);
	}
});
//the add window to the room event listener
addWindowHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	//if the room exists
	if (indexRemoveRoom != -1) {
		//add the window
		let direction = (<HTMLInputElement>document.getElementById("doorOptions")).value;
		scene2D.getRooms()[indexRemoveRoom].addWindow(direction, 0.1, clickedX, clickedY);
		main.drawScene(scene2D);
	}
});
//the click action
main.subscribeClick((x, y) => {
	//we determine the coordinate of the clicked point
	//console.log(x + " " + y);
	let [p, d] = scene2D.getRayTo2DPoint(x, y);
	let clickedPoint = scene2D.convert2DPointTo3DWorld(x, y)
	clickedX = clickedPoint[0];
	clickedY = clickedPoint[1];
	let result = false;

	for (let i = 0; i < scene2D.getWallGeometries().length; i++) {
		let wallGeometry = scene2D.getWallGeometries()[i];
		for (let j = 0; j < wallGeometry.getSquare().getTriangles().length; j++) {
			//console.log(wallGeometry.getSquare().getTriangles()[j].getVerticesArray());
			result = wallGeometry.getSquare().rayIntersectsSquare(p, d, scene2D.getModelViewMatrix());
			if (result) {
				//indexRemoveRoom = i;
				//removeRoomHTMLInput.disabled = false;
				console.log(wallGeometry.getWall().getOrientation());
				selectedWall = wallGeometry.getWall();
				break;
			}
		}
	}


	//we determine the room (the clicked point can belong to one room or other area)
	/*for (let i = 0; i < scene2D.getRooms().length; i++) {
		for (let j = 0; j < scene2D.getRooms()[i].getSquares().length; j++) {
			for (let k = 0; k < scene2D.getRooms()[i].getSquares()[j].getTriangles().length; k++) {
				result = scene2D.getRooms()[i].getSquares()[j].getTriangles()[k].rayIntersectsTriangle(p, d, scene2D.getModelViewMatrix());
				if (result) {
					indexRemoveRoom = i;
					removeRoomHTMLInput.disabled = false;
					break;
				}
			}
			if (result) {
				indexRemoveRoom = i;
				removeRoomHTMLInput.disabled = false;
				break;
			}
		}
		if (result) {
			indexRemoveRoom = i;
			removeRoomHTMLInput.disabled = false;
			break;
		} else {
			indexRemoveRoom = -1;
			removeRoomHTMLInput.disabled = true;
		}
	}
	//if the clicked point belongs to one room
	if (indexRemoveRoom != -1) {
		//we write the datas of the clicked room to the form
		(<HTMLInputElement>document.getElementById("roomUpperLeftX")).value = scene2D.getRooms()[indexRemoveRoom].getRoomMValues()[0] + "";
		(<HTMLInputElement>document.getElementById("roomUpperLeftY")).value = scene2D.getRooms()[indexRemoveRoom].getRoomMValues()[1] + "";
		(<HTMLInputElement>document.getElementById("roomWidth")).value = scene2D.getRooms()[indexRemoveRoom].getRoomMValues()[2] + "";
		(<HTMLInputElement>document.getElementById("roomHeight")).value = scene2D.getRooms()[indexRemoveRoom].getRoomMValues()[3] + "";
		(<HTMLInputElement>document.getElementById("roomName")).value = scene2D.getRooms()[indexRemoveRoom].getRoomName() + "";
		(<HTMLInputElement>document.getElementById("roomBorder")).value = scene2D.getRooms()[indexRemoveRoom].getRoomMValues()[4] + "";
	}*/

	//alert(result);
});
