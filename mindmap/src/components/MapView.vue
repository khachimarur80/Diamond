<template>
    <div id="map-content" v-if="viewMap">
        <v-btn class="toggleMapView mt-2 mr-2" icon dense @click="toggleMapView">
            <v-icon>
                mdi-database
            </v-icon>
        </v-btn>
        <svg id="svg" width="100%" height="100%">
            
        </svg>
    </div>
</template>

<script>
    import EventBus from '../event-bus.js';

    export default {
        name: 'MapView',
    
        data: () => ({
        }),

        props: {
            viewMap: {
                required: true,
            },
            currentGroup: {
                required: true,
            }
        },

        methods: {
            toggleMapView() {
                EventBus.$emit('toggleMapView')
            },
            //Functions to obtain objects by their ID
            getWordById(id) {
                for(let i=0; i<this.currentGroup.words.length; i++) {
                    if (this.currentGroup.words[i].id==id) {
                        return this.currentGroup.words[i]
                    }
                }
            },
            getCategoryById(id) {
                for(let i=0; i<this.currentGroup.categories.length; i++) {
                    if (this.currentGroup.categories[i].id==id) {
                        return this.currentGroup.categories[i]
                    }
                }
            },
            getConnectionById(id) {
                for(let i=0; i<this.currentGroup.connections.length; i++) {
                    if (this.currentGroup.connections[i].id==id) {
                        return this.currentGroup.connections[i]
                    }
                }
            },
        },

        mounted() {
            let x = 0;
            let y = 0;
            let connections = 0;

            let maxWidth = parseInt(document.getElementById('map-content').getBoundingClientRect().width/180)

            for (let i=0; i<this.currentGroup.connections.length; i++) {
                let connectionObj = this.currentGroup.connections[i];
                for (let j=0; j<connectionObj.connections.length; j++) {

                    const relationObj = connectionObj.connections[j]

                    let component1Obj = this.getWordById(relationObj.component1);
                    if (!component1Obj) {
                        component1Obj = this.getCategoryById(relationObj.component1);
                    }
                    let component1Div = document.createElement('div')

                    component1Div.id = component1Obj.id+'-'+connections
                    component1Div.innerText = component1Obj.name

                    component1Div.style.top = `${40 + y*60}px`
                    component1Div.style.left = `${40 + x*180}px`
                    x += 1
                    if (x>=maxWidth) {
                        x = 0
                        y += 1
                    }

                    component1Div.classList.add('wordObj')
                    document.getElementById('map-content').appendChild(component1Div)

                    let component2Obj = this.getWordById(relationObj.component2);
                    if (!component2Obj) {
                        component2Obj = this.getCategoryById(relationObj.component2);
                    }
                    let component2Div = document.createElement('div')

                    component2Div.id = component2Obj.id+'-'+connections
                    component2Div.innerText = component2Obj.name

                    component2Div.style.top = `${40 + y*60}px`
                    component2Div.style.left = `${40 + x*180}px`
                    x += 1
                    if (x>=maxWidth) {
                        x = 0
                        y += 1
                    }

                    component2Div.classList.add('wordObj')
                    document.getElementById('map-content').appendChild(component2Div)

                    let component1 = document.getElementById(relationObj.component1+'-'+connections);
                    let component2 = document.getElementById(relationObj.component2+'-'+connections);

                    let x1 = parseInt(component1.style.left) + component1.getBoundingClientRect().width/2;
                    let y1 = parseInt(component1.style.top) + component1.getBoundingClientRect().height/2;
                    let x2 = parseInt(component2.style.left) + component2.getBoundingClientRect().width/2;
                    let y2 = parseInt(component2.style.top) + component2.getBoundingClientRect().height/2;

                    let centerX = (x1 + x2) / 2;
                    let centerY = (y1 + y2) / 2;

                    let length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

                    let angle = Math.atan2(y2 - y1, x2 - x1);

                    let halfWidth = (length / 2) - (length / 4);
                    let halfHeight = 20;

                    let xTop = centerX - halfWidth * Math.cos(angle);
                    let yTop = centerY - halfWidth * Math.sin(angle);

                    let xRight = centerX - halfHeight * Math.sin(angle);
                    let yRight = centerY + halfHeight * Math.cos(angle);

                    let xBottom = centerX + halfWidth * Math.cos(angle);
                    let yBottom = centerY + halfWidth * Math.sin(angle);

                    let xLeft = centerX + halfHeight * Math.sin(angle);
                    let yLeft = centerY - halfHeight * Math.cos(angle);

                    let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

                    let diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                    diamond.setAttribute("points", `${xTop},${yTop} ${xRight},${yRight} ${xBottom},${yBottom} ${xLeft},${yLeft}`);
                    diamond.setAttribute("fill", "#262626");
                    diamond.setAttribute("stroke", "#bbb");
                    diamond.setAttribute("stroke-width", "1");

                    let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("x", centerX);
                    text.setAttribute("y", centerY);
                    text.setAttribute("text-anchor", "middle");
                    text.setAttribute("fill", "#bbb");
                    text.setAttribute("dy", "5");
                    text.setAttribute("transform", `rotate(${(angle * 180) / Math.PI} ${centerX} ${centerY})`);
                    text.textContent = connectionObj.name;

                    group.appendChild(line);
                    group.appendChild(diamond);
                    group.appendChild(text);

                    line.setAttribute('x1', x1+'px')
                    line.setAttribute('y1', y1+'px')
                    line.setAttribute('x2', x2+'px')
                    line.setAttribute('y2', y2+'px')
                    line.setAttribute('stroke', 'white')
                    line.setAttribute('stroke-width', '1')

                    document.getElementById('svg').appendChild(group)
                    connections += 1
                }
            }
        }

    };
</script>