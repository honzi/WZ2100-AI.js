function buildOrder(){
    // Check module need.
    var powerModuleNeeded = checkNeedPowerModule();
    var researchModuleNeeded = checkNeedResearchModule();

    // Give orders to idle construction droids.
    var droids = enumDroid(
      me,
      DROID_CONSTRUCT,
      me
    );
    droids.some(function check_droid_idle(checked_droid){
        if(!checkDroidIdle(checked_droid)){
            return;
        }

        // Finish incomplete buildings first.
        var structures = enumStruct(me);
        for(var structure in structures){
            if(structures[structure].status !== BUILT){
                orderDroidObj(
                  checked_droid,
                  DORDER_HELPBUILD,
                  structures[structure]
                );

                return;
            }
        }

        // Build 1 Research Facility.
        if(checkStructure(
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              checked_droid,
              'A0ResearchFacility'
            );

        // Build 1 Power Generator.
        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              checked_droid,
              'A0PowerGenerator'
            );

        // Build 4 Resource Extractors.
        }else if(checkStructure(
            'A0ResourceExtractor',
            4
          )){
            buildStructure(
              checked_droid,
              'A0ResourceExtractor'
            );

        // Build as many Research Facilities as possible.
        }else if(checkStructure(
            'A0ResearchFacility',
            limitResearchFacilities
          )){
            buildStructure(
              checked_droid,
              'A0ResearchFacility'
            );

        // Build 1 Command Center.
        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              checked_droid,
              'A0CommandCentre'
            );

        // Build 1 Factory.
        }else if(checkStructure(
            'A0LightFactory',
            1
          )){
            buildStructure(
              checked_droid,
              'A0LightFactory'
            );

        // Build Power Modules.
        }else if(powerModuleNeeded !== false){
            buildStructure(
              checked_droid,
              'A0PowMod1',
              powerModuleNeeded.x,
              powerModuleNeeded.y
            );

        // Build Research Modules.
        }else if(researchModuleNeeded !== false){
            buildStructure(
              checked_droid,
              'A0ResearchModule1',
              researchModuleNeeded.x,
              researchModuleNeeded.y
            );
        }
    });

    // Give orders to idle Research Facilities.
    var researchFacilities = enumStruct(
      me,
      'A0ResearchFacility',
      me
    );
    researchFacilities.some(function check_researchFacility_idle(checked_researchFacility){
        if(checked_researchFacility.status !== BUILT
          || !structureIdle(checked_researchFacility)){
            return;
        }

        pursueResearch(
          checked_researchFacility,
          researchOrder
        );
    });

    // Make sure we have at least 2 construction droids.
    if(droids.length < 2){
        var factories = enumStruct(
          me,
          'A0LightFactory',
          me
        );

        if(factories.length > 0
          && structureIdle(factories[0])){
            buildDroid(
              factories[0],
              'Drone',
              'Body1REC',
              'wheeled01',
              '',
              DROID_CONSTRUCT,
              'Spade1Mk1'
            );
        }
    }

    queue(
      'buildOrder',
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

function checkDroidIdle(droid){
    return !(droid.order === DORDER_BUILD
      || droid.order === DORDER_HELPBUILD);
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

    powerGenerators.some(function check_powerGenerator_needmodule(checked_powerGenerator){
        if(checked_powerGenerator.modules !== 0){
            return;
        }

        generator = checked_powerGenerator;
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

    researchFacilities.some(function check_researchFacility_needmodule(checked_researchFacility){
        if(checked_researchFacility.modules !== 0){
            return;
        }

        facility = checked_researchFacility;
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
    // Get limitations.
    limitResearchFacilities = getStructureLimit(
      'A0ResearchFacility',
      me
    );

    // Start build order loop.
    queue(
      'buildOrder',
      0
    );
}

var limitResearchFacilities = 5;
const researchOrder = [
];
