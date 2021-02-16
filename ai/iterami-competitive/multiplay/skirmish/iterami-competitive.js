function buildOrder(){
    setMiniMap(true);

    var droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    var droidCount = droids.length;
    var lessThan2 = droidCount < 2;
    var structures = enumStruct(me);

    droids.some(function check_droid(droid){
        var isProjectManager = droid === droids[droidCount - 1];

        if(!isProjectManager
          || lessThan2){
            for(var structure in structures){
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

        for(var structure in structures){
            if(structures[structure].status !== BUILT){
                orderDroidObj(
                  droid,
                  DORDER_HELPBUILD,
                  structures[structure]
                );

                return;
            }
        }

        if(!isProjectManager){
            return;
        }

        var factoryModuleNeeded = checkNeedModule(
          'A0LightFactory',
          'A0FacMod1'
        );
        var powerModuleNeeded = checkNeedModule(
          'A0PowerGenerator',
          'A0PowMod1'
        );
        var researchModuleNeeded = checkNeedModule(
          'A0ResearchFacility',
          'A0ResearchModule1'
        );

        if(checkStructure(
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              droid,
              'A0ResearchFacility'
            );

        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              droid,
              'A0PowerGenerator'
            );

        }else if(checkStructure(
            'A0ResourceExtractor',
            maxResourceExtractors
          )){
            buildStructure(
              droid,
              'A0ResourceExtractor'
            );

        }else if(checkStructure(
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              droid,
              'A0ResearchFacility'
            );

        }else if(checkStructure(
            'A0LightFactory',
            maxFactories
          )){
            buildStructure(
              droid,
              'A0LightFactory'
            );

        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              droid,
              'A0CommandCentre'
            );

        }else if(powerModuleNeeded !== false){
            buildStructure(
              droid,
              'A0PowMod1',
              powerModuleNeeded.x,
              powerModuleNeeded.y
            );

        }else if(researchModuleNeeded !== false){
            buildStructure(
              droid,
              'A0ResearchModule1',
              researchModuleNeeded.x,
              researchModuleNeeded.y
            );

        }else if(factoryModuleNeeded !== false){
            buildStructure(
              droid,
              'A0FacMod1',
              factoryModuleNeeded.x,
              factoryModuleNeeded.y
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

function checkNeedModule(structure, module){
    if(!isStructureAvailable(
        module,
        me
      )){
        return false;
    }

    var moduleNeeded = false;
    var structures = enumStruct(
      me,
      structure
    );
    structures.some(function check_structure(checkedStructure){
        if(checkedStructure.modules !== 0){
            return;
        }

        moduleNeeded = checkedStructure;
    });

    return moduleNeeded;
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

    setTimer(
      'buildOrder',
      timerBuildOrder
    );
    buildOrder();
}

function randomLocation(){
    return {
      'x': Math.floor(Math.random() * mapWidth),
      'y': Math.floor(Math.random() * mapHeight),
    };
}

function randomResearch(){
    var research = enumResearch();

    if(research.length === 0){
        maxConstructionDroids = 5;
        maxResearchFacilities = 1;
        researchDone = true;
        return;
    }

    return research[Math.floor(Math.random() * research.length)].name;
}

var maxConstructionDroids = 2;
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
var researchDone = false;
var timerBuildOrder = 1000;
