function buildOrder(){
    setMiniMap(true);

    var droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    var droidCount = droids.length;
    var lessThan2 = droidCount < 2;
    var powerModuleNeeded = checkNeedPowerModule();
    var researchModuleNeeded = checkNeedResearchModule();
    var structures = enumStruct(me);

    droids.some(function check_droid(droid){
        var isProjectManager = droid === droids[droidCount - 1];

        // Chores for regular construction droids.
        // Project manager must do these if nobody else can.
        if(!isProjectManager
          || lessThan2){
            for(var structure in structures){
                // Repair damaged structures.
                if(structures[structure].health < 100
                  && structures[structure].status === BUILT){
                    if(droid.order !== DORDER_REPAIR){
                        orderDroidObj(
                          droid,
                          DORDER_REPAIR,
                          structures[structure]
                        );
                    }

                    return;
                }
            }
        }

        if(droid.order === DORDER_BUILD
          || droid.order === DORDER_HELPBUILD){
            return;
        }

        // Chores for all construction droids.
        for(var structure in structures){
            // Finish incomplete structures.
            if(structures[structure].status !== BUILT){
                orderDroidObj(
                  droid,
                  DORDER_HELPBUILD,
                  structures[structure]
                );

                return;
            }
        }

        // Only project managers get to decide where to build.
        if(!isProjectManager){
            return;
        }

        // Build 1 Research Facility.
        if(checkStructure(
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              droid,
              'A0ResearchFacility'
            );

        // Build 1 Power Generator.
        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              droid,
              'A0PowerGenerator'
            );

        // Build Resource Extractors.
        }else if(checkStructure(
            'A0ResourceExtractor',
            maxResourceExtractors
          )){
            buildStructure(
              droid,
              'A0ResourceExtractor'
            );

        // Build Research Facilities.
        }else if(checkStructure(
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              droid,
              'A0ResearchFacility'
            );

        // Build Factories.
        }else if(checkStructure(
            'A0LightFactory',
            maxFactories
          )){
            buildStructure(
              droid,
              'A0LightFactory'
            );

        // Build 1 Command Center.
        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              droid,
              'A0CommandCentre'
            );

        // Build Power Modules.
        }else if(powerModuleNeeded !== false){
            buildStructure(
              droid,
              'A0PowMod1',
              powerModuleNeeded.x,
              powerModuleNeeded.y
            );

        // Build Research Modules.
        }else if(researchModuleNeeded !== false){
            buildStructure(
              droid,
              'A0ResearchModule1',
              researchModuleNeeded.x,
              researchModuleNeeded.y
            );
        }
    });

    if(!researchDone){
        var researchFacilities = enumStruct(
          me,
          'A0ResearchFacility',
          me
        );
        researchFacilities.some(function check_researchFacility(researchFacility){
            if(researchFacility.status !== BUILT
              || !structureIdle(researchFacility)){
                return;
            }

            pursueResearch(
              researchFacility,
              randomResearch()
            );
        });
    }

    if(droidCount < maxConstructionDroids){
        var factories = enumStruct(
          me,
          'A0LightFactory',
          me
        );
        factories.some(function check_factory(factory){
            if(factory.status !== BUILT
              || !structureIdle(factory)){
                return;
            }

            buildDroid(
              factory,
              'Drone',
              'Body1REC',
              'wheeled01',
              '',
              DROID_CONSTRUCT,
              'Spade1Mk1'
            );
        });
    }

    queue(
      'buildOrder',
      queueTimer
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
          location.y,
          Math.floor(Math.random() * 4) * 90
        );
    }
}

function checkNeedPowerModule(){
    if(!isStructureAvailable(
        'A0PowMod1',
        me
      )){
        return false;
    }

    var generator = false;
    var powerGenerators = enumStruct(
      me,
      'A0PowerGenerator',
      me
    ).reverse();
    powerGenerators.some(function check_powerGenerator(powerGenerator){
        if(powerGenerator.modules !== 0){
            return;
        }

        generator = powerGenerator;
    });

    return generator;
}

function checkNeedResearchModule(){
    if(!isStructureAvailable(
        'A0ResearchModule1',
        me
      )){
        return false;
    }

    var facility = false;
    var researchFacilities = enumStruct(
      me,
      'A0ResearchFacility',
      me
    ).reverse();
    researchFacilities.some(function check_researchFacility(researchFacility){
        if(researchFacility.modules !== 0){
            return;
        }

        facility = researchFacility;
    });

    return facility;
}

function checkStructure(structure, count){
    return isStructureAvailable(
      structure,
      me
    ) && countStruct(structure) < count;
}

function eventGameLoaded(){
    init();
}

function eventStartLevel(){
    init();
}

function init(){
    maxResearchFacilities = getStructureLimit(
      'A0ResearchFacility',
      me
    );

    queue(
      'buildOrder',
      0
    );
}

function randomLocation(){
    return {
      'x': Math.floor(Math.random() * mapWidth),
      'y': Math.floor(Math.random() * mapHeight),
    };
}

function randomResearch(){
    var research = enumResearch();

    // Modify strategy when all research is done.
    if(research.length === 0){
        maxConstructionDroids = 5;
        maxResearchFacilities = 1;
        researchDone = true;
        return;
    }

    return [research[Math.floor(Math.random() * research.length)].name];
}

var maxConstructionDroids = 2;
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
var queueTimer = 1000;
var researchDone = false;
