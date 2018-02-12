function buildOrder(){
    // Find an available construction droid.
    var droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );

    var idledroid = false;
    droids.some(function check_droid_idle(checked_droid){
        if(isIdle(checked_droid)){
            idledroid = checked_droid;
            return true;
        }
    });

    if(idledroid !== false){
        // Build one Resource Extractor.
        if(checkStructureCount(
          "A0ResourceExtractor",
          1
        )){
            buildStructure(
              idledroid,
              "A0ResourceExtractor"
            );

        // Build two Power Generators.
        }else if(checkStructureCount(
          "A0PowerGenerator",
          2
        )){
            buildStructure(
              idledroid,
              "A0PowerGenerator"
            );

        // Build four Resource Extractors.
        }else if(checkStructureCount(
          "A0ResourceExtractor",
          4
        )){
            buildStructure(
              idledroid,
              "A0ResourceExtractor"
            );

        // Build five Research Facilities.
        }else if(checkStructureCount(
          "A0ResearchFacility",
          5
        )){
            buildStructure(
              idledroid,
              "A0ResearchFacility"
            );

        // Build one HQ.
        }else if(checkStructureCount(
          "A0CommandCentre",
          1
        )){
            buildStructure(
              idledroid,
              "A0CommandCentre"
            );

        // Build one Factory.
        }else if(checkStructureCount(
          "A0LightFactory",
          1
        )){
            buildStructure(
              idledroid,
              "A0LightFactory"
            );
        }
    }

    queue(
      "buildOrder",
      0
    );
}

function buildStructure(droid, structure){
    var location = pickStructLocation(
      droid,
      structure,
      droid.x,
      droid.y
    );

    if(location){
        orderDroidBuild(
          droid,
          DORDER_BUILD,
          structure,
          location.x,
          location.y
        );
    }
}

function checkStructureCount(structure, count){
    return countStruct(structure) < count;
}

function eventAttacked(victim, attacker){
    if(me !== victim.player){
        return;
    }
}

function eventChat(sender, to, message){
}

function eventDesignCreated(template){
}

function eventDestroyed(gameObject){
}

function eventDroidBuilt(droid, structure){
}

function eventDroidIdle(droid){
}

function eventObjectSeen(sensor, gameObject){
}

function eventPickup(item, droid){
}

function eventResearched(research, structure){
}

function eventStartLevel(){
    queue(
      "buildOrder",
      0
    );
}

function eventStructureBuilt(structure, droid){
}

function eventStructureReady(structure){
}

function isIdle(droid){
    return droid.order !== DORDER_BUILD;
}
