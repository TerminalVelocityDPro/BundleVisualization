window.onload = function () {
        var fileupload = document.getElementById("FileUpload1");
        var filePath = document.getElementById("spnFilePath");
        var button = document.getElementById("btnFileUpload");


        button.onclick = function () {
            fileupload.click();
        };
        fileupload.onchange = function () {
            clearMap();

            var fileName = fileupload.value.split('\\')[fileupload.value.split('\\').length - 1];
            filePath.innerHTML = "<b>Selected File: </b>" + fileName;
            setUpMap(fileName);

   };
};


function clearMap(){
var svg = d3.select("body").select("svg").remove();
}





function setUpMap(fileNameFinal){
var w = 10000;
      var h = 10000;

      var nodeMap = [];
      var leftSide = [];
      var rightSide = [];
      var allBundles = [];
      var beep = false;

      var edgeMap = [];
      var layer = 0;
      var lastLayer = -1;






      var svg = d3.select("body").append("svg");


      //svg is a reference pointing to the SVG object just created
      svg.attr("width", w).attr("height", h);

      function checkStatus(nodeMap){
        for(i = 0; i < nodeMap.length; i++){
          console.log(nodeMap[i].name + " " + nodeMap[i].status + " layer: " + nodeMap[i].layerNum + " type: " + nodeMap[i].type);
        }

      }

      function currentLayer(){
        console.log("Layer is " + layer);
      }

      function checkEdges(edgeMap){
        for(i = 0; i < edgeMap.length; i++){
          console.log(edgeMap[i].node1.name + " " + edgeMap[i].node1.status + " " + edgeMap[i].node2.name + " " + edgeMap[i].node2.status + " " + edgeMap[i].layerNum + " " + edgeMap[i].vis);
        }
      }




      function cleanse(){
        for(i = 0; i < nodeMap.length; i++){
          if(nodeMap[i].status == "dead"){
            var removed = nodeMap.splice(i,i);
            i = 0;
          }
        }
      }

      function returnNodeAndEdgeMap(data){
        var graph = data;
        var nodeMap2 = [];
        var edgeMap2 = [];
        for(i = 0; i < graph.node.length; i++){
          node1 = new Node(i*30, 100 + (200 * (i%2)), "id" + graph.node[i].id, layer, "normal", "alive", []);
          nodeMap2.push(node1);
        }
        for(i = 0; i < graph.edge.length; i++){
          var node1;
          var node2;
          for(j = 0; j < nodeMap2.length; j++){
            if(nodeMap2[j].name == ("id" + graph.edge[i].from)){
              node1 = nodeMap2[j];
            }
            if(nodeMap2[j].name == ("id" + graph.edge[i].to)){
              node2 = nodeMap2[j];
            }
          }
          edge1 = new Edge(node1, node2, layer, "vis");
          edgeMap2.push(edge1);
        }
        for(i = 0; i < edgeMap2.length; i++){
          duplicates = [];
          for(j = 0; j < edgeMap2.length; j++){
            if(edgeMap2[i].name == edgeMap2[j].name){
              if(i != j){
                edgeMap2.splice(j, 1);
              }
            }
          }
        }
        var container = [];
        container.push(nodeMap2);
        container.push(edgeMap2);
        return container;
      }


      d3.json(fileNameFinal, function(data){
        nodeMap = returnNodeAndEdgeMap(data)[0];
        edgeMap = returnNodeAndEdgeMap(data)[1];
        for(i = 0; i < nodeMap.length; i++){
          nodeMap[i].present();
        }
        for(i = 0; i < edgeMap.length; i++){
          edgeMap[i].establish();
        }

        leftSide = [[nodeMap[0], false]];
        rightSide = [];

        //while(find_all_bundles(nodeMap, edgeMap, layer).length > 0){
        //bundleFunction(nodeMap, edgeMap);
        //}
      });


      //orient = true means getLeftNeighbors
      //orient = false means getRightNeighbors

      function getOrientNeighbors(node1, orient1, edgeMap){
        node1neighbors = [];
        if(orient1 == true){
          node1.getLeftNeighbors(edgeMap);
          for(i = 0; i < node1.leftNeighbors.length; i++){
            var pusher = [node1.leftNeighbors[i], !orient1];
            node1neighbors.push(pusher);
          }
        }
        if(orient1 == false){
          node1.getRightNeighbors(edgeMap);
          for(i = 0; i < node1.rightNeighbors.length; i++){
            var pusher = [node1.rightNeighbors[i], !orient1];
            node1neighbors.push(pusher);
          }
        }
        return node1neighbors;

      }

      function check_combined_node_neighbors(node1, orient1, node2, orient2, edgeMap){
        var node1neighbors = [];
        var node2neighbors = [];
        var common = false;

        node1neighbors = getOrientNeighbors(node1, orient1, edgeMap);
        node2neighbors = getOrientNeighbors(node2, orient2, edgeMap);


        for(i = 0; i < node1neighbors.length; i++){
          for(j = 0; j < node2neighbors.length; j++){
            if((node2neighbors[j][0].name == node1neighbors[i][0].name) && (node2neighbors[j][1] == node1neighbors[i][1])){
              common = true;
              break;
            }
          }

        }
        return common;
      }

      function shared_neighbors(node1, orient1, node2, orient2, edgeMap){
        var node1neighbors = [];
        var node2neighbors = [];
        var shared_neighbors_set = [];
        node1neighbors = getOrientNeighbors(node1, orient1, edgeMap);
        node2neighbors = getOrientNeighbors(node2, orient2, edgeMap);
        for(i = 0; i < node1neighbors.length; i++){
          for(j = 0; j < node2neighbors.length; j++){
            if(node2neighbors[j][0].name == node1neighbors[i][0].name && node2neighbors[j][1] == node1neighbors[i][1]){
              shared_neighbors_set.push(node1neighbors[i]);
            }
          }
        }
        return shared_neighbors_set;
      }

      function combined_node_neighbors(node1, orient1, node2, orient2, edgeMap){
        var node1neighbors = [];
        var node2neighbors = [];
        var every_single_neighbor = [];
        node1neighbors = getOrientNeighbors(node1, orient1, edgeMap);
        node2neighbors = getOrientNeighbors(node2, orient2, edgeMap);
        var shared = [];
        shared = shared_neighbors(node1, orient1, node2, orient2, edgeMap);
        if((shared.length == node1neighbors.length) && (shared.length == node2neighbors.length)){
          every_single_neighbor = shared;
        }else{
          for(i = 0; i < node1neighbors.length; i++){
            is_in = false;
            for(j = 0; j < shared.length; j++){
              if(shared[j][0].name == node1neighbors[i][0].name && shared[j][1] == node1neighbors[i][1]){
                is_in = true;
              }
            }
            if(is_in){
              continue;
            }else{
              every_single_neighbor.push(node1neighbors[i]);
            }
          }
          for(i = 0; i < node2neighbors.length; i++){
            is_in = false;
            for(j = 0; j < shared.length; j++){
              if(shared[j][0].name == node2neighbors[i][0].name && shared[j][1] == node2neighbors[i][1]){
                is_in = true;
              }
            }
            if(is_in){
              continue;
            }else{
              every_single_neighbor.push(node2neighbors[i]);
            }

          }
          for(i = 0; i < shared.length; i++){
            every_single_neighbor.push(shared[i]);

          }
        }
        return every_single_neighbor;
      }

      function all_neighbors(nodeOrientSet, edgeMap){
        var every_neighbor_s = [];
        var copy_every_neighbor_s = [];

        for(i2 = 0; i2 < nodeOrientSet.length; i2++){

          var neighbors = getOrientNeighbors(nodeOrientSet[i2][0], nodeOrientSet[i2][1], edgeMap);

          for(j = 0; j < neighbors.length; j++){
            if(neighbors[j][0].status != "bundleZombie"){
            every_neighbor_s.push(neighbors[j]);

			}

          }
        }

        for(i = 0; i < every_neighbor_s.length; i++){
          if(copy_every_neighbor_s.length > 0){
            is_in = false;
            for(j = 0; j < copy_every_neighbor_s.length; j++){
              if(copy_every_neighbor_s[j][0].name == every_neighbor_s[i][0].name && copy_every_neighbor_s[j][1] == every_neighbor_s[i][1]){
                is_in = true;
              }
            }
            if(is_in){
              continue;
            }else{
              copy_every_neighbor_s.push(every_neighbor_s[i]);
            }
          }else{
            copy_every_neighbor_s.push(every_neighbor_s[i]);

          }
        }
        return copy_every_neighbor_s;
      }

      function check_all_neighbors(nodeSet, edgeMap){
        var check = true;
        var neighbors_c = getOrientNeighbors(nodeSet[0][0], nodeSet[0][1], edgeMap);
        //console.log("first check");
        //console.log(nodeSet[0][0].name);
        //console.log(neighbors_c.length);
        for(i2 = 0; i2 < nodeSet.length; i2++){
          var neighbors_t = getOrientNeighbors(nodeSet[i2][0], nodeSet[i2][1], edgeMap);
          if(neighbors_t.length != neighbors_c.length){
            check = false;
            return check;
          }
        }
        for(i2 = 0; i2 < nodeSet.length; i2++){
          check = false;
          var neighbors_t = getOrientNeighbors(nodeSet[i2][0], nodeSet[i2][1], edgeMap);
            for(j = 0; j < neighbors_t.length; j++){
              for(k = 0; k < neighbors_c.length; k++){
                if(neighbors_c[k][0].name == neighbors_t[j][0].name && neighbors_c[k][1] == neighbors_t[j][1]){
                  check = true;
                  break;
                }else{
                  check = false;
                }
              }
            }
        }
        return check;
      }

      function adjust_sides(leftSide, rightSide, edgeMap){
        var neighbors_l = all_neighbors(leftSide, edgeMap);
        var adjuster = [];
        for(i = 0; i < rightSide.length; i++){
          adjuster.push(rightSide[i]);
        }
        for(i = 0; i < neighbors_l.length; i++){
        //console.log("adjusting");
        //console.log(neighbors_l[i][0].name);
          is_in = false;
          for(j = 0; j < adjuster.length; j++){
            if(adjuster[j][0].name == neighbors_l[i][0].name && adjuster[j][1] == neighbors_l[i][1]){
              is_in = true;
              break;
            }
          }

          if(is_in){
            continue;
          }
          else{
            adjuster.push(neighbors_l[i]);
          }
        }
        return adjuster;
      }

      function check_overlap(side1, side2){
        var common = false;
        var side1_u = [];
        var side2_u = [];
        for(i = 0; i < side1.length; i++){
          side1_u.push(side1[i][0].name);
        }
        for(i = 0; i < side2.length; i++){
          side2_u.push(side2[i][0].name);
        }

        for(i = 0; i < side1_u.length; i++){

          for(j = 0; j < side2_u.length; j++){
            if(side1_u[i] == side2_u[j]){
              common = true;
              break;
              break;
            }
          }
        }
        return common;
      }

      function find_overlap(side1, side2){
        var overlapping_nodes = [];
        for(i = 0; i < side1.length; i++){
          var is_in = false;
          for(j = 0; j < side2.length; j++){
            if(side1[i][0].name == side2[j][0].name && side1[i][1] == side2[j][1]){
              is_in = true;
              break;
            }
          }
          if(is_in){
            overlapping_nodes.push(side1[i]);
          }
        }
        return overlapping_nodes;
      }



      function new_or_not(handle, nodeSet){
        var newness = false;
        for(i = 0; i < nodeSet.length; i++){
          if(nodeSet[i][0].name != handle[0].name || nodeSet[i][1] != handle[1]){
            newness = true;
          }else{
            newness = false;
          }
        }
        return newness;
      }

      function new_or_not_big(firstSet, secondSet){
        var newness = false;
        for(p = 0; p < firstSet.length; p++){
          for(q = 0; q < secondSet.length; q++){
            if(secondSet[q][0].name != firstSet[p][0].name || secondSet[q][1] != firstSet[p][1]){
              newness = true;
            }else{
              newness = false;
            }
          }
        }
        if(firstSet.length == 0 || secondSet.length == 0){
          newness = true;
        }
        return newness;
      }

      function find_bundle(side1, side2, edgeMap){
		var nodeName = side1[0][0].name;
        var bundle = [];
        var randomNode = new Node(0,0,"id0",0,"normal", "dead", []);
        var not_found = true;
        while(not_found){
          var overlap_there = check_overlap(side1, side2);
          if(overlap_there){
            //console.log("overlap");
            bundle = [];
            not_found = false;
            break;
          }
          var check_equal_neighbors = check_all_neighbors(side1, edgeMap);
          if(!check_equal_neighbors){
            //console.log("equal neighbors");
            bundle = [];
            not_found = false;
            break;
          }
          var side3 = adjust_sides(side1, side2, edgeMap);
          var any_change = new_or_not_big(side3, side2);
          if(!any_change){

			  if(side1.length == 1 || side2.length == 1){
				  for(r = 0; r < side1.length; r++){
				  //console.log("side1");
				  //console.log(side1[r][0].name);
				    bundle.push(side1[r]);
				  }
				  for(r = 0; r < side2.length; r++){
				  //console.log("side2");
				  //console.log(side2[r][0].name);
				    bundle.push(side2[r]);
                  }
			  }else{
				  console.log("not trivial bundle");
				  console.log("nodename" + nodeName);
				  var nodeBool = false;

				  for(r = 0; r < side1.length; r++){
				              //console.log("side1");
				              //console.log(side1[r][0].name);
				              //bundle.push(side1[r]);
				     if(side1[r][0].name == nodeName){
					 nodeBool = true;
					 }
				  }
				  console.log(nodeBool);
				  if(nodeBool){
					console.log("pushing side 1");
					  for(r=0; r < side1.length; r++){
					  //console.log(side1[r][0].name);
						  bundle.push(side1[r]);
					  }

				  }
				  else{
					  console.log("pushing side 2");
					  for(r=0; r < side2.length; r++){
						  bundle.push(side2[r]);
					  }
				  }
				              //for(r = 0; r < side2.length; r++){
				              //console.log("side2");
				              //console.log(side2[r][0].name);
				              //  bundle.push(side2[r]);
            //}
			  }


            not_found = false;
            break;
          }
          else{
          //console.log("meme");
            side2 = [];
            for(r = 0; r < side3.length; r++){
              side2.push(side3[r]);
            }
            side3 = [];
            var a = side1;
            var b = side2;
            side1 = b;
            side2 = a;
          }
        }
        for(i = 0; i < bundle.length; i++){
        }
        return bundle;
      }

      function find_all_bundles(nodeMap, edgeMap, layer){
        var bundles = [];
        var avoid = [];
        var all_handles = genHandleMap(nodeMap, layer);
        for(b = 0; b < all_handles.length; b++){
          var is_in = false;
          for(a = 0; a < avoid.length; a++){
            if(avoid[a][0].name == all_handles[b][0].name && avoid[a][1] == all_handles[b][1]){
              is_in = true;
              break;
            }else{
            }
          }
          if(is_in == false){
            var left_side = [];
            var right_side = [];
            left_side.push(all_handles[b]);
            var bundle = find_bundle(left_side, right_side, edgeMap);
            if(bundle.length != 0){
              for(c = 0; c < bundle.length; c++){
                avoid.push(bundle[c]);
              }
              bundles.push(bundle);
            }
          }
          if(is_in == true){
            continue;
          }

        }

        for(h = 0; h < bundles.length; h++){
          for(l = 0; l < bundles[h].length; l++){
            if(bundles[h][l][0].status != "alive"){
              bundles[h].splice(l, 1);
              l = 0;
              h = 0;
            }
          }
        }

        for(h = 0; h < bundles.length; h++){
          for(l = 0; l < bundles[h].length; l++){
          }
        }
        return bundles;
      }


      function getAllBundles(nodeMap, edgeMap, layer){
        allBundles2 = allBundles;

        if(find_all_bundles(nodeMap, edgeMap, layer).length != 0){
          allBundles = find_all_bundles(nodeMap, edgeMap, layer);
        }
        //
        if(find_all_bundles(nodeMap, edgeMap, layer).length == 0){
          allBundles = [];
        }

        return allBundles;


      }

      function remakeNodes(nodeMap){
      for(i = 0; i < nodeMap.length; i++){
       if(nodeMap[i].status == "alive"){
        nodeMap[i].present();
	   }
	  }

	  }

      function collapseBundle(name, nodeMap, edgeMap){
      var node;
      for(i = 0; i < nodeMap.length; i++){
       if(nodeMap[i].name == name){
       node = nodeMap[i];
	   }
	  }


       if(find_bundle([[node, false]], [], edgeMap).length == 0){
       //console.log("no right bundle");
       bundle = find_bundle([[node, true]], [], edgeMap);
       var totalX = 0;
       var totalY = 0;
       var newName = "";
       for(i = 0; i < bundle.length; i++){
        totalX = totalX + bundle[i][0].x;
        totalY = bundle[i][0].y;
        newName = newName + bundle[i][0].name;
        //console.log("getting removed " + bundle[i][0].name);
        svg.selectAll("." + bundle[i][0].name).remove();
	   }
	   }
       else{
       //console.log("welp there is a right bundle");
       bundle = find_bundle([[node, false]], [], edgeMap);
       var totalX = 0;
       var totalY = 0;
       var newName = "";
       for(i = 0; i < bundle.length; i++){
        totalX = totalX + bundle[i][0].x;
        totalY = bundle[i][0].y;
        newName = newName + bundle[i][0].name;
        //console.log("getting removed " + bundle[i][0].name);
        svg.selectAll("." + bundle[i][0].name).remove();
	   }
	   }
       var averageX = (totalX/bundle.length);
       var averageY = (totalY);
       var newNode = new Node(averageX+50, averageY+50, newName, layer, "bundleCollapsed", "alive", bundle);
       //var newNode2 = new Node(averageX+50, averageY+50, newName, layer, "bundleCollapsed", "alive", bundle);
       newNode.getLeftNeighbors(edgeMap);
       newNode.getRightNeighbors(edgeMap);

       for(j = 0; j < nodeMap.length; j++){
        for(k = 0; k < bundle.length; k++){
            if(nodeMap[j].name == bundle[k][0].name){
               nodeMap[j].status = "bundleZombie";
			}
		}
	   }

       for(j = 0; j < edgeMap.length; j++){
            for(k = 0; k < bundle.length; k++){
              if(edgeMap[j].node1.name == bundle[k][0].name){

                edgeMap[j].node1.status = "bundleZombie";
                edgeMap[j].vis = "invis";
                svg.selectAll("." + edgeMap[j].node1.name).remove();
                //svg.selectAll("." + edgeMap[j].node2.name).remove();
                svg.selectAll("." + edgeMap[j].name).remove();
                var flag = true;
                for(m = 0; m < bundle.length; m++){
                    if(bundle[m][0].name == edgeMap[j].node2.name || edgeMap[j].node2.status == "bundleZombie"){

                    flag = false;
					}
				}
                if(flag){
                var newEdge = new Edge(newNode, edgeMap[j].node2, 0, "vis");
                //console.log("left side");
                //console.log("This is new edge: " + newEdge.node1.name + " " + newEdge.node2.name);
                edgeMap.push(newEdge);
                newEdge.establish();
                //edgeMap[j].node2.present();
				}


              }
              if(edgeMap[j].node2.name == bundle[k][0].name){
              //console.log("getting considererd");
              //console.log(edgeMap[j].node1.name);
              //console.log("getting conc");

                edgeMap[j].node2.status = "bundleZombie";
                edgeMap[j].vis = "invis";
                //svg.selectAll("." + edgeMap[j].node1.name).remove();
                svg.selectAll("." + edgeMap[j].node2.name).remove();
                svg.selectAll("." + edgeMap[j].name).remove();

                var flag = true;
                for(m = 0; m < bundle.length; m++){
                    if(bundle[m][0].name == edgeMap[j].node1.name || edgeMap[j].node1.status == "bundleZombie"  ){
                    flag = false;
					}
				}
                if(flag){
                var newEdge = new Edge(edgeMap[j].node1, newNode, 0, "vis");
                //console.log("right side");
                //console.log("This is new edge: " + newEdge.node1.name + " " + newEdge.node2.name);
                edgeMap.push(newEdge);
                newEdge.establish();
                //edgeMap[j].node1.present();
				}


              }
            }
          }

        newNode.present();
        //newNode2.present();
        svg.selectAll("#red").remove();
			svg.selectAll("#blue").remove();



        for(i = 0; i < edgeMap.length; i++){
          if(edgeMap[i].vis == "invis"){
            //console.log("deleting edge " + edgeMap[i].name);
            svg.selectAll("." + edgeMap[i].name).remove();
          }
        }
        //console.log("This is the bundle I just collapsed");
        for(i = 0; i < bundle.length; i++){
            //console.log(bundle[i][0].name);
		}





        //console.log("x position");
        //console.log(newNode.x);
        //newNode.present();
        nodeMap.push(newNode);
        //remakeNodes(nodeMap);

        //adjustBundleEdges(nodeMap,edgeMap);
        checkDuplicateEdges(edgeMap);
        remakeEdges(edgeMap);
	  }

      function finalCollapseBundle(name, nodeMap, edgeMap){
		  svg.selectAll("#red").remove();
			svg.selectAll("#blue").remove();

			collapseBundle(name, nodeMap, edgeMap);
			svg.selectAll("#red").remove();
			svg.selectAll("#blue").remove();


       for(i = 0; i < nodeMap.length; i++){
       if(nodeMap[i].status == "alive"){
		   console.log(nodeMap[i].name);
        nodeMap[i].present();
	   }
	   console.log(nodeMap[i].name);
	   }
	   svg.selectAll("#red").remove();
			svg.selectAll("#blue").remove();

	  }

      function collapseBundles(nodeMap, edgeMap, allBundles, layer){
        for(i = 0; i < allBundles.length; i++){
          var totalX = 0;
          var totalY = 0;
          var newName = "";
          for(j = 0; j < allBundles[i].length; j++){
            totalX = totalX + allBundles[i][j][0].x;
            totalY = totalY + allBundles[i][j][0].y;
            newName = newName + allBundles[i][j][0].name;
            svg.selectAll("." + allBundles[i][j][0].name).remove();
          }
          var averageX = (totalX/allBundles[i].length);
          var averageY = (totalY/allBundles[i].length);
          var newNode = new Node(averageX, averageY, newName, layer, "bundleCollapsed", "alive", allBundles[i]);
          newNode.getLeftNeighbors(edgeMap);
          newNode.getRightNeighbors(edgeMap);
          nodeMap.push(newNode);
          for(j = 0; j < nodeMap.length; j++){
            for(k = 0; k < allBundles[i].length; k++){
              if(nodeMap[j].name == allBundles[i][k][0].name){
                nodeMap[j].status = "bundleZombie";
              }
            }
          }

          for(j = 0; j < edgeMap.length; j++){
            for(k = 0; k < allBundles[i].length; k++){
              if(edgeMap[j].node1.name == allBundles[i][k][0].name){
                edgeMap[j].node1.status = "bundleZombie";
                edgeMap[j].vis = "invis";
                svg.selectAll("." + edgeMap[j].node1.name).remove();
                svg.selectAll("." + edgeMap[j].node2.name).remove();
                svg.selectAll("." + edgeMap[j].name).remove();
              }
              if(edgeMap[j].node2.name == allBundles[i][k][0].name){
                edgeMap[j].node2.status = "bundleZombie";
                edgeMap[j].vis = "invis";
                svg.selectAll("." + edgeMap[j].node1.name).remove();
                svg.selectAll("." + edgeMap[j].node2.name).remove();
                svg.selectAll("." + edgeMap[j].name).remove();
              }
            }
          }


          newNode.present();
        }

      }

      function expandBundle(nodeMap, edgeMap, bundleName){
      //console.log(bundleName);
      var bundleNode;
      for(i = 0; i < nodeMap.length; i++){
       if(nodeMap[i].name == bundleName && nodeMap[i].type == "bundleCollapsed"){
        bundleNode = nodeMap[i];
	   }
	  }
      var bundle = bundleNode.bundle;

      //console.log(bundle.length);
      //console.log("this is the bundle I am expanding");
      for(i = 0; i < bundle.length; i++){
       //console.log(bundle[i][0].name);
	  }



       for(i = 0; i < bundle.length; i++){
       //console.log(bundle[i][0].name);
       bundle[i][0].present();
       for(j = 0; j < nodeMap.length; j++){
        if(nodeMap[j].name == bundle[i][0].name){
            nodeMap[j].status = "alive";
		}
	   }
	   }
       for(j = 0; j < bundle.length; j++){
              for(k = 0; k < bundle.length; k++){
                for(q = 0; q < edgeMap.length; q++){
                  if(edgeMap[q].node1.name == bundle[j][0].name
                    && edgeMap[q].node2.name == bundle[k][0].name){
                      edgeMap[q].node1.status = "alive";
                      edgeMap[q].node2.status = "alive";
                      edgeMap[q].vis = "vis";
                      edgeMap[q].establish();
                    }
                  if(edgeMap[q].node1.name == bundle[k][0].name
                    && edgeMap[q].node2.name == bundle[j][0].name){
                      edgeMap[q].node1.status = "alive";
                      edgeMap[q].node2.status = "alive";
                      edgeMap[q].vis = "vis";
                      edgeMap[q].establish();
                    }
                }
              }
              }
        for(j = 0; j < edgeMap.length; j++){
        if(edgeMap[j].node1.status == "alive" && edgeMap[j].node2.status == "alive"){
            edgeMap[j].vis = "vis";
            edgeMap[j].establish();
		}
        }



        //for(j =0; j < edgeMap.length; j++){

          //  if(edgeMap[j].node1.status == "bundleZombie" || edgeMap[j].node2.status == "bundleZombie"){
            //var flag = true;

            //for(k = 0; k < bundle.length; k++){
              //  if(bundle[k][0].name == edgeMap[j].node1.name || bundle[k][0].name == edgeMap[j].node2.name){
                //flag = false;

				//}
            //}
            //if(flag){

			//}


			//}


		//}

        svg.selectAll("." + bundleNode.name).remove();
        for(p = 0; p < edgeMap.length; p++){
              if(edgeMap[p].node1.name == bundleNode.name){
                svg.selectAll("." + edgeMap[p].name).remove();
                edgeMap.splice(p, 1);
                p = 0;
              }
              if(edgeMap[p].node2.name == bundleNode.name){
              svg.selectAll("." + edgeMap[p].name).remove();
                edgeMap.splice(p, 1);
                p = 0;

			  }
            }

        bundleNode.status = "dead";
        //cleanse();



	  }

      function finalExpandBundle(nodeMap, edgeMap, bundleName){
       expandBundle(nodeMap, edgeMap, bundleName);
       for(j = 0; j < edgeMap.length; j++){
        if(edgeMap[j].node1.status == "alive" && edgeMap[j].node2.status == "alive"){
            edgeMap[j].vis = "vis";
            edgeMap[j].establish();
		}
        }
        cleanse();

	  }

      function expandBundles(nodeMap, edgeMap){
        if((layer - 1) != -1){
          layer--;
        }
        for(i = 0; i < nodeMap.length; i++){
          if(nodeMap[i].type == "bundleCollapsed" && nodeMap[i].layerNum == (layer+1)){
            for(j = 0; j < nodeMap[i].bundle.length; j++){
              nodeMap[i].bundle[j][0].present();
              for(k = 0; k < nodeMap.length; k++){
                if(nodeMap[k].name == nodeMap[i].bundle[j][0].name){
                  nodeMap[k].status = "alive";
                }
              }
            }
            for(j = 0; j < nodeMap[i].bundle.length; j++){
              for(k = 0; k < nodeMap[i].bundle.length; k++){
                for(q = 0; q < edgeMap.length; q++){
                  if(edgeMap[q].node1.name == nodeMap[i].bundle[j][0].name
                    && edgeMap[q].node2.name == nodeMap[i].bundle[k][0].name){
                      edgeMap[q].node1.status = "alive";
                      edgeMap[q].node2.status = "alive";
                      edgeMap[q].vis = "vis";
                      edgeMap[q].establish();
                    }
                  if(edgeMap[q].node1.name == nodeMap[i].bundle[k][0].name
                    && edgeMap[q].node2.name == nodeMap[i].bundle[j][0].name){
                      edgeMap[q].node1.status = "alive";
                      edgeMap[q].node2.status = "alive";
                      edgeMap[q].vis = "vis";
                      edgeMap[q].establish();
                    }
                }
              }
            }
            svg.selectAll("." + nodeMap[i].name).remove();
            for(p = 0; p < edgeMap.length; p++){
              if(edgeMap[p].node1.name == nodeMap[i].name){
                svg.selectAll("." + edgeMap[p].name).remove();
                edgeMap.splice(p, 1);
                p = 0;
              }
            }
            nodeMap[i].status = "dead";
          }
        }
        cleanse();
      }

      function bundleFunction(nodeMap, edgeMap){
        if(find_all_bundles(nodeMap, edgeMap, layer).length != 0){
          layer++;
          collapseBundles(nodeMap, edgeMap, find_all_bundles(nodeMap, edgeMap, layer-1), layer);
          adjustBundleEdges(nodeMap, edgeMap);
          checkDuplicateEdges(edgeMap);
          remakeEdges(edgeMap);

        }
      }



      function checkIntersect(side1, side2){
        for(ci = 0; ci < side1.length; ci++){
          for(cj = 0; cj < side2.length; cj++){

            if(side2[cj][0].name == side1[ci][0].name){
              return true;
            }else{
            }
          }
        }
        return false;

      }

      function adjustBundleEdges(nodeMap, edgeMap){

        for(i = 0; i < nodeMap.length; i++){
          if(nodeMap[i].layerNum == layer && nodeMap[i].type == "bundleCollapsed"){
            var bundleFriends = [];
            for(j = 0; j < nodeMap.length; j++){
              if(nodeMap[j].type == "bundleCollapsed" && nodeMap[j].name != nodeMap[i].name && nodeMap[j].layerNum == layer){
                //console.log("first " + nodeMap[i].name);
                //console.log("second " + nodeMap[j].name);
                //console.log(checkIntersect(nodeMap[i].bundle, nodeMap[j].bundle))
                if(checkIntersect(nodeMap[i].bundle, nodeMap[j].bundle)){
                  var newEdge;
                  newEdge = new Edge(nodeMap[i], nodeMap[j], layer, "vis");
                  newEdge.establish();
                  edgeMap.push(newEdge);
                  bundleFriends.push(nodeMap[j]);
                }
              }

            }
          }
        }




      }



      function genHandleMap(nodeMap, layer){
        var handleMap = [];
        for(i = 0; i < nodeMap.length; i++){
          if(nodeMap[i].layerNum == layer){
            handleMap.push([nodeMap[i], true]);
            handleMap.push([nodeMap[i], false]);
          }
        }
        return handleMap;
      }

      function checkDuplicateEdges(edgeMap){
        var newEdgeMap = [];
        var duplicates = [];
        var edgeMapCount = [];
        for(i = 0; i < edgeMap.length; i++){
          var edgeCount = [];
          var edgeCountNum = 0;
          edgeCount.push(edgeMap[i]);
          for(j = 0; j < edgeMap.length; j++){
            if(edgeMap[i].name == edgeMap[j].name){
              edgeCountNum++;
            }
            if(edgeMap[i].name == edgeMap[j].altname){
              edgeCountNum++;
            }
          }
          edgeCount.push(edgeCountNum);
          edgeMapCount.push(edgeCount);
        }
        for(i = 0; i < edgeMapCount.length; i++){
          if(edgeMapCount[i][1] > 1){
            //console.log("dupe edges");
            //console.log(edgeMapCount[i][0].name + " " + edgeMapCount[i][1]);
            svg.selectAll("." + edgeMapCount[i][0].name).remove();
          }
        }
        for(i = 0; i < edgeMapCount.length; i++){
          if(edgeMapCount[i][1] == 1){
            newEdgeMap.push(edgeMapCount[i][0]);
          }
          else{
            var duplicate = false;
            for(j = 0; j < duplicates.length; j++){
              if(edgeMapCount[i][0].name == duplicates[j].name || edgeMapCount[i][0].name == duplicates[j].altname){
                duplicate = true;
                break;
              }
            }
            if(!duplicate){
              newEdgeMap.push(edgeMapCount[i][0]);
              duplicates.push(edgeMapCount[i][0]);
            }
          }
        }

        for(i = 0; i < newEdgeMap.length; i++){

          for(j = 0; j < newEdgeMap.length; j++){
            if(newEdgeMap[i].name == newEdgeMap[j].altname){
              //console.log("dupe");
              //console.log(newEdgeMap[i].name);
              //console.log(newEdgeMap[j].name);
            }
          }
        }
        //console.log("newEdgeMap");
        for(i = 0; i < newEdgeMap.length; i++){
          //console.log(newEdgeMap[i].node1.name + " " + newEdgeMap[i].node2.name);
        }
        //console.log("newEdgeMap");
        edgeMap.length = 0;
        for(i = 0; i < newEdgeMap.length; i++){
          newEdgeMap[i].establish();
          edgeMap.push(newEdgeMap[i]);
        }
      }

      function remakeEdges(edgeMap){
        for(i = 0; i < edgeMap.length; i++){
          if(edgeMap[i].vis == "invis"){
            //console.log("deleting edge " + edgeMap[i].name);
            svg.selectAll("." + edgeMap[i].name).remove();
          }
        }

      }







      class Node {
        constructor(x, y, name, layerNum, type, status, bundle) {
          this.x = x;
          this.y = y;
          this.name = name;
          this.rightNeighbors = [];
          this.leftNeighbors = [];
          this.i = 0;
          this.j = 0;
          this.status = status;
          this.type = type;
          this.layerNum = layerNum;
          this.bundle = bundle;
          this.leftSide = [];
          this.rightSide = [];
        }
        present(){
          svg.append("rect")
          .attr("x", this.x)
          .attr("y", this.y)
          .attr("width", 10)
          .attr("height", 20)
          .attr("fill", "#f7f7f7")
          //.attr("visibility", "hidden")
          .attr("id", this.name+"red")

          .attr("class", this.name);
          svg.append("rect")
          .attr("x", this.x+10)
          .attr("y", this.y)
          .attr("width", 10)
          .attr("height", 20)
          .attr("fill", "#f7f7f7")
          .attr("id", this.name+"blue")

          //.attr("visibility", "hidden")
          .attr("class", this.name);




          svg.selectAll("#" + this.name + "red")
          .transition()
          .attr("stroke", "white")
          .attr("fill", "red")
          .delay(100)
          .duration(1200);

          svg.selectAll("#" + this.name + "blue")
		  .transition()
		  .attr("stroke", "white")
		  .attr("fill", "blue")
		  .delay(100)
          .duration(1200);

          var name = this.name;

          var xpos = this.x;
          var ypos = this.y;





          var node = svg.selectAll("." + this.name);

          node.on("mouseover", function(){
	  		console.log(name);
	  		svg.append("text")
	  		.attr("x", xpos)
	  		.attr("y", ypos)
	  		.attr("stroke", "blue")
	  		.text(name);
	  		svg.selectAll("#red").remove();
			svg.selectAll("#blue").remove();
          });

          node.on("mouseout", function(){
		  	svg.selectAll("text").remove();
		  	svg.selectAll("#red").remove();
			svg.selectAll("#blue").remove();
          });

          d3.select("body").select("svg").on("mouseover", function(){
			svg.selectAll("#red").remove();
			svg.selectAll("#blue").remove();
		  });

          node.on("click", function(){
			svg.selectAll("#red").remove();
			svg.selectAll("#blue").remove();
          if(d3.event.ctrlKey){
          finalCollapseBundle(name, nodeMap, edgeMap);


          svg.selectAll("text").remove();
		  }else{
          //console.log("start");
          //console.log("end");
          finalExpandBundle(nodeMap, edgeMap, name);
          svg.selectAll("text").remove();
		  }

          });

        }

        getRightNeighbors(edgeMap){
          this.rightNeighbors = [];
          this.i = 0;
          for(;this.i < edgeMap.length; this.i++){
            if(edgeMap[this.i].node1.name == this.name){
              this.rightNeighbors.push(edgeMap[this.i].node2);
            }
          }
        }
        getLeftNeighbors(edgeMap){
          this.leftNeighbors = [];
          this.i = 0;
          for(;this.i < edgeMap.length; this.i++){
            if(edgeMap[this.i].node2.name == this.name){
              this.leftNeighbors.push(edgeMap[this.i].node1);
            }
          }
        }

        getBundleRightNeighbors(edgeMap){

        }
        getBundleLeftNeighbors(edgeMap){

        }
      }

      class Edge {
        constructor(node1, node2, layerNum, vis) {
          this.node1 = node1;
          this.node2 = node2;
          this.name = this.node1.name + this.node2.name;
          this.altname = this.node2.name + this.node1.name;
          this.layerNum = layerNum;
          this.vis = vis;

        }
        establish(){
            svg.append("line")
            .attr("x1", this.node1.x+20)
            .attr("y1", this.node1.y+10)
            .attr("x2", this.node2.x)
            .attr("y2", this.node2.y+10)
            //.transition()
            .attr("stroke", "white")
            //.delay(500)
            //.duration(2500)
            //.transition()
            //.attr("stroke", "black")
            //.delay(500)
            //.duration(2500)
            .attr("class", this.name);

            svg.selectAll("." + this.name)
            .transition()
            .attr("stroke", "black")
            .delay(500)
            .duration(1250);
        }
      }
}







