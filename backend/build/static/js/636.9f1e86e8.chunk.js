"use strict";(self.webpackChunkmapbox_react_app=self.webpackChunkmapbox_react_app||[]).push([[636],{9944:function(e,t,n){var a=n(2791),i=n(6681),r=n(184);t.Z=function(e){var t=e.isSplitView,n=e.setSplitView,s=(0,i.f)(),o=s.setEventForAnalysisComponent,l=s.setShowChart,c=s.neighbourhoodEvents;return(0,a.useEffect)((function(){c&&c.length>0&&o(c[0])}),[c]),(0,r.jsx)("div",{className:"split-view-controller",children:(0,r.jsx)("button",{className:"split-view-controller-toggle-button",onClick:function(){l(!1),n(!t)},children:t?"Return to Single Map View":"Show Splitview"})})}},6636:function(e,t,n){n.r(t),n.d(t,{default:function(){return g}});var a=n(1413),i=n(885),r=n(2791),s=n(3183),o=n(5483),l=n.n(o),c=n(9944),u=n(6681),p=(n(3508),n(9806)),f=n(1632),d=n(184);var h=function(e){var t=e.leftMap,n=e.rightMap,a=e.originalBusynessHashMap,s=e.timelapseData,o=e.baselineTimelapseData,l=e.busynessHashMap,c=(0,u.f)(),h=c.updateLayerColours,v=c.neighbourhoodEvents,m=(0,r.useState)(!1),y=(0,i.Z)(m,2),g=y[0],b=y[1],x=(0,r.useState)(0),w=(0,i.Z)(x,2),S=w[0],M=w[1],j=(0,r.useState)(0),C=(0,i.Z)(j,2),P=C[0],N=C[1],Z=(0,r.useState)(null),k=(0,i.Z)(Z,2),D=(k[0],k[1]),E=(0,r.useRef)(null);(0,r.useEffect)((function(){D(v[0])}),[v]);var T=function(){b(!1),clearInterval(E.current)};return(0,r.useEffect)((function(){if(S>=24&&function(){var e=o[16];N(0),M(0),b(!1),clearInterval(E.current),setTimeout((function(){h(t.current,!1,l,e),h(n.current,!1,l,l)}),400)}(),Number.isInteger(S)&&s&&s.hasOwnProperty(P)){var e=s[P],i=o[P];h(n.current,!1,a,e),h(t.current,!1,a,i),N(P+1)}}),[S]),(0,r.useEffect)((function(){return function(){E.current&&clearInterval(E.current)}}),[]),(0,d.jsxs)("div",{className:"timelapse-container",children:[(0,d.jsxs)("button",{className:"timelapse-button",onClick:function(){g?T():(b(!0),E.current=setInterval((function(){M((function(e){return e+1}))}),1e3))},children:[g?(0,d.jsx)(p.G,{icon:f.XQY,style:{color:"#D3D3D3"}}):(0,d.jsx)(p.G,{icon:f.zc,style:{color:"#D3D3D3"}}),(0,d.jsx)("label",{htmlFor:"toggle",className:"timelapse-label",children:g?"pause":"play"})]}),(0,d.jsxs)("div",{className:"slider-container-parent",children:[(0,d.jsx)("div",{className:"slider-context-container",children:(0,d.jsxs)("p",{className:"elapsed-time-text",children:[" Local Time: ",S>=10?"":0,S,":00 ",S>=12?"PM":"AM"]})}),(0,d.jsx)("div",{className:"slider-container",children:(0,d.jsx)("input",{type:"range",min:"0",max:"24",value:S,onChange:function(e){T();var i=Number(e.target.value);M(i);var r=Math.floor(i);if(s&&s.hasOwnProperty(r)){var l=s[r],c=o[r];h(n.current,!1,a,l),h(t.current,!1,a,c),N(r)}}})})]})]})},v=(n(3161),n(7729)),m={position:"absolute",width:"50%",height:"100vh"},y={position:"absolute",left:"50%",width:"50%",height:"100vh"};var g=function(e){var t=e.eventBaselineHashMap,n=e.busynessHashMap,o=e.timelapseData,p=e.baselineTimelapseData,f=(0,u.f)(),g=f.MAPBOX_ACCESS_TOKEN,b=f.isSplitView,x=f.setSplitView,w=f.renderNeighbourhoods,S=(f.markers,f.mapStyle),M=(0,u.f)().updateLayerColours,j=(0,u.f)(),C=j.colourPairs,P=j.colourPairIndex,N=j.neighbourhoods,Z=(0,r.useRef)(),k=(0,r.useRef)(),D=(0,r.useRef)(null),E=(0,r.useState)({longitude:-73.9857,latitude:40.7484,zoom:11.2,pitch:30}),T=(0,i.Z)(E,2),B=T[0],L=T[1],A=(0,r.useState)("side-by-side"),V=(0,i.Z)(A,2),H=V[0],I=(V[1],(0,r.useState)("left")),R=(0,i.Z)(I,2),_=R[0],z=R[1],O=(0,r.useCallback)((function(){return z("left")}),[]),F=(0,r.useCallback)((function(){return z("right")}),[]),W=(0,r.useCallback)((function(e){return L(e.viewState)}),[]),G="undefined"===typeof window?100:window.innerWidth,X=(0,r.useMemo)((function(){return{left:"split-screen"===H?G/1:0,top:0,right:0,bottom:0}}),[G,H]),q=(0,r.useMemo)((function(){return{right:"split-screen"===H?G/1:0,top:0,left:0,bottom:0}}),[G,H]),K=function(e,t){var n=(0,v.Z)().domain([0,.4,.8]).range(C[P]);N.features.forEach((function(a){e.on("mousemove",a.id,(function(i){e.getCanvas().style.cursor="pointer",e.setPaintProperty(a.id,"fill-opacity",.9),e.setPaintProperty(a.id+"-line","line-width",4);var r=e.queryRenderedFeatures(i.point,{layers:[a.id]});if(r.length>0){if(!D.current){var s=10,o={top:[0,0],"top-left":[0,0],"top-right":[0,0],bottom:[0,-10],"bottom-left":[5,-5],"bottom-right":[-5,-5],left:[s,-0],right:[-10,-0]};D.current=new(l().Popup)({offset:o,closeButton:!1,closeOnClick:!1})}var c,u=r[0].properties.zone,p=t[a.id],f=n(p);c=p<.29?"Not Very Busy":p>=.29&&p<.4?"Relatively Busy":p>=.4&&p<.7?"Busy":"Extremely Busy",D.current.setLngLat(i.lngLat).setHTML("".concat(u,': <span style="color: ').concat(f,'">').concat(c,'</span>\n          <br>\n          Busyness Score:  <span style="color: ').concat(f,'">').concat(Math.floor(100*p),"</span>\n          ")).addTo(e)}})),e.on("mouseleave",a.id,(function(){e.getCanvas().style.cursor="",e.setPaintProperty(a.id,"fill-opacity",.6),e.setPaintProperty(a.id+"-line","line-width",0),D.current&&(D.current.remove(),D.current=null)}))}))},Q=(0,r.useCallback)((function(e){var a=e.target;Z.current=a,console.log("r",a),w(a),M(a,!0,t,n),K(a,t)}),[w]),Y=(0,r.useCallback)((function(e){var a=e.target;k.current=a,console.log("r",a),w(a),M(a,!1,t,n),K(a,n)}),[w]);return(0,d.jsx)(d.Fragment,{children:(0,d.jsxs)("div",{style:{position:"relative",height:"100vh"},children:[(0,d.jsx)(s.ZP,(0,a.Z)((0,a.Z)({id:"left-map"},B),{},{padding:X,onMoveStart:O,onMove:"left"===_?W:void 0,style:m,mapStyle:S,mapboxAccessToken:g,onLoad:function(e){return Q(e)}})),(0,d.jsx)("div",{className:"split-view-map-label",style:{top:"18px",left:"64px",fontSize:"14px",fontWeight:"400"},children:"Typical Manhattan Activity Map"}),(0,d.jsx)(s.ZP,(0,a.Z)((0,a.Z)({id:"right-map"},B),{},{padding:q,onMoveStart:F,onMove:"right"===_?W:void 0,style:y,mapStyle:S,mapboxAccessToken:g,onLoad:function(e){return Y(e)}})),(0,d.jsx)("div",{className:"split-view-map-label",style:{top:"18px",right:"64px",fontSize:"14px",fontWeight:"400"},children:"Event-Impacted Manhattan Activity Map"}),(0,d.jsx)(c.Z,{isSplitView:b,setSplitView:x}),(0,d.jsx)(h,{leftMap:Z,rightMap:k,eventBaselineHashMap:t,busynessHashMap:n,baselineTimelapseData:p,timelapseData:o})]})})}}}]);
//# sourceMappingURL=636.9f1e86e8.chunk.js.map