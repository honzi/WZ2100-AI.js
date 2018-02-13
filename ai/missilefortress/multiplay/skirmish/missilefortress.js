function buildOrder(){
    // Find an idle construction droid.
    var droids = enumDroid(
      me,
      DROID_CONSTRUCT,
      me
    );
    var idle_droid = false;
    droids.some(function check_droid_idle(checked_droid){
        if(isDroidIdle(checked_droid)){
            idle_droid = checked_droid;
            return true;
        }
    });

    if(idle_droid !== false){
        // Build one Resource Extractor.
        if(checkStructureCount(
          "A0ResourceExtractor",
          1
        )){
            buildStructure(
              idle_droid,
              "A0ResourceExtractor"
            );

        // Build one Power Generator.
        }else if(checkStructureCount(
          "A0PowerGenerator",
          1
        )){
            buildStructure(
              idle_droid,
              "A0PowerGenerator"
            );

        // Build four Resource Extractors.
        }else if(checkStructureCount(
          "A0ResourceExtractor",
          4
        )){
            buildStructure(
              idle_droid,
              "A0ResourceExtractor"
            );

        // Build five Research Facilities.
        }else if(checkStructureCount(
          "A0ResearchFacility",
          5
        )){
            buildStructure(
              idle_droid,
              "A0ResearchFacility"
            );

        // Build one HQ.
        }else if(checkStructureCount(
          "A0CommandCentre",
          1
        )){
            buildStructure(
              idle_droid,
              "A0CommandCentre"
            );

        // Build one Factory.
        }else if(checkStructureCount(
          "A0LightFactory",
          1
        )){
            buildStructure(
              idle_droid,
              "A0LightFactory"
            );

        // Build many Missile Fortresses.
        }else if(isStructureAvailable(
          "R-Defense-Super-Missile",
          me
        )){
            buildStructure(
              idle_droid,
              "R-Defense-Super-Missile"
            );
        }
    }

    // Find an idle Research Facility.
    var researchFacilities = enumStruct(
      me,
      "A0ResearchFacility",
      me
    );
    var idle_researchFacility = false;
    researchFacilities.some(function check_researchFacility_idle(checked_researchFacility){
        if(isStructureIdle(checked_researchFacility)){
            idle_researchFacility = checked_researchFacility;
            return true;
        }
    });

    // Pursue Missle Fortress research.
    if(idle_researchFacility !== false){
        pursueResearch(
          idle_researchFacility,
          "R-Defense-Super-Missile"
        );
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

function isDroidIdle(droid){
    return droid.order !== DORDER_BUILD;
}

function isStructureIdle(structure){
    return structure.status == BUILT && structureIdle(structure);
}
