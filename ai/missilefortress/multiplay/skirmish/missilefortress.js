function buildOrder(){
    // Give orders to idle construction droids.
    var droids = enumDroid(
      me,
      DROID_CONSTRUCT,
      me
    );
    // Check module need.
    var powerModuleNeeded = checkNeedPowerModule();
    var researchModuleNeeded = checkNeedResearchModule();

    droids.some(function check_droid_idle(checked_droid){
        if(checked_droid.order !== DORDER_BUILD){

            // Build one Resource Extractors.
            if(checkStructure(
              "A0ResourceExtractor",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0ResourceExtractor"
                );

            // Build one Power Generator.
            }else if(checkStructure(
              "A0PowerGenerator",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0PowerGenerator"
                );

            // Build four Resource Extractors.
            }else if(checkStructure(
              "A0ResourceExtractor",
              4
            )){
                buildStructure(
                  checked_droid,
                  "A0ResourceExtractor"
                );

            // Build five Research Facilities.
            }else if(checkStructure(
              "A0ResearchFacility",
              5
            )){
                buildStructure(
                  checked_droid,
                  "A0ResearchFacility"
                );

            // Build one Command Center.
            }else if(checkStructure(
              "A0CommandCentre",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0CommandCentre"
                );

            // Build one Repair Facility.
            }else if(checkStructure(
              "A0RepairCentre3",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0RepairCentre3"
                );

            // Build Power Modules.
            }else if(powerModuleNeeded !== false){
                buildStructure(
                  checked_droid,
                  "A0PowMod1",
                  powerModuleNeeded.x,
                  powerModuleNeeded.y
                );

            // Build Research Modules.
            }else if(researchModuleNeeded !== false){
                buildStructure(
                  checked_droid,
                  "A0ResearchModule1",
                  researchModuleNeeded.x,
                  researchModuleNeeded.y
                );

            // Build many Missile Fortresses.
            }else if(isStructureAvailable(
              "X-Super-Missile",
              me
            )){
                buildStructure(
                  checked_droid,
                  "X-Super-Missile"
                );
            }
        }
    });

    // Give orders to idle Research Facilities.
    var researchFacilities = enumStruct(
      me,
      "A0ResearchFacility",
      me
    );
    researchFacilities.some(function check_researchFacility_idle(checked_researchFacility){
        if(checked_researchFacility.status == BUILT && structureIdle(checked_researchFacility)){
            // Pursue research.
            pursueResearch(
              checked_researchFacility,
              [
                "R-Struc-Power-Upgrade03a", // Vapor Turbine Generator Mk3
                "R-Defense-Super-Missile", // Missile Fortress
                "R-Struc-Research-Upgrade09", // Neural Synapse Research Brain Mk3
                "R-Wpn-Missile-Damage03", // Advanced Missile Warhead Mk3
                "R-Sys-Autorepair-General", // Auto-Repair
                "R-Struc-Materials09", // Advanced Base Structure Materials Mk3
                "R-Struc-RprFac-Upgrade06", // Advanced Repair Facility
                "R-Vehicle-Metals09", // Superdense Composite Alloys Mk3
                "R-Vehicle-Armor-Heat09", // Vehicle Superdense Thermal Armor Mk3
              ]
            );
        }
    });

    queue(
      "buildOrder",
      0
    );
}

function buildStructure(droid, structure, x, y){
    x = x || droid.x;
    y = y || droid.y;

    var location = pickStructLocation(
      droid,
      structure,
      x,
      y
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

function checkNeedPowerModule(){
    var powerGenerators = enumStruct(
      me,
      "A0PowerGenerator",
      me
    );
    var generator = false;
    powerGenerators.some(function check_powerGenerator_needmodule(checked_powerGenerator){
        if(checked_powerGenerator.modules == 0){
            generator = checked_powerGenerator;
            return true;
        }
    });

    if(generator !== false){
        return generator;
    }

    return false;
}

function checkNeedResearchModule(){
    var researchFacilities = enumStruct(
      me,
      "A0ResearchFacility",
      me
    );
    var facility = false;
    researchFacilities.some(function check_researchFacility_needmodule(checked_researchFacility){
        if(checked_researchFacility.modules == 0){
            facility = checked_researchFacility;
            return true;
        }
    });

    if(facility !== false){
        return facility;
    }

    return false;
}

function checkStructure(structure, count){
    return isStructureAvailable(
      structure,
      me
    ) && countStruct(structure) < count;
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
