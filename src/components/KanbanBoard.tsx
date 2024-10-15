// import { useRef } from "react";
// import { createSwapy } from "swapy";

// export default function KanbanBoard() {
//   const containerRef = useRef(null);

//   const swapy = createSwapy(containerRef.current, {
//     animation: "dynamic", // or spring or none
//   });

//   // You can disable and enable it anytime you want
//   swapy.enable(true);

//   return (
//     <div className="container" ref={containerRef}>
//       <div className="section-1" data-swapy-slot="foo">
//         <div className="content-a" data-swapy-item="a">
//           <div>Hello</div>
//         </div>
//       </div>

//       <div className="section-2" data-swapy-slot="bar">
//         <div className="content-b" data-swapy-item="b">
//           <div>Hello</div>
//           <div className="handle" data-swapy-handle></div>
//         </div>
//       </div>

//       <div className="section-3" data-swapy-slot="baz">
//         <div className="content-c" data-swapy-item="c">
//           <div>Hello</div>
//         </div>
//       </div>
//     </div>
//   );
// }
