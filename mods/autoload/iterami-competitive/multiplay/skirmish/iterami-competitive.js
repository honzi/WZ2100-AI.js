include('iterami.js');

function eventAttacked(victim, attacker){
    if(victim.player !== me){
        return;
    }

    if(victim.group === groupAttack){
        attack(
          groupAttack,
          attacker,
          false
        );

    }else if(victim.type === STRUCTURE){
        attack(
          groupDefend,
          attacker,
          true
        );
    }
}

function eventDroidBuilt(droid, structure){
    if(droid.droidType === DROID_CONSTRUCT){
        return;
    }

    groupAddDroid(
      groupDefend,
      droid
    );

    if(groupSize(groupDefend) >= limitDroidsAttack){
        var defenders = enumGroup(groupDefend);

        for(var i = 0; i < maxDroidsDefend; i++){
            groupAddDroid(
              groupAttack,
              defenders[Math.floor(Math.random() * (defenders.length - i))]
            );
        }
    }
}

function eventResearched(research, structure, player){
    if(me !== player){
        return;
    }

    var bodyResearch = {
      'R-Vehicle-Body02': 'Body2SUP',
      'R-Vehicle-Body03': 'Body3MBT',
      'R-Vehicle-Body04': 'Body4ABT',
      'R-Vehicle-Body05': 'Body5REC',
      'R-Vehicle-Body06': 'Body6SUPP',
      'R-Vehicle-Body07': 'Body7ABT',
      'R-Vehicle-Body08': 'Body8MBT',
      'R-Vehicle-Body09': 'Body9REC',
      'R-Vehicle-Body10': 'Body10MBT',
      'R-Vehicle-Body11': 'Body11ABT',
      'R-Vehicle-Body12': 'Body12SUP',
      'R-Vehicle-Body13': 'Body13SUP',
      'R-Vehicle-Body14': 'Body14SUP',
    };
    var defenseStructureResearch = {
      'R-Defense-Emplacement-HPVcannon': 'Emplacement-HPVcannon',
      'R-Defense-PrisLas': 'Emplacement-PrisLas',
      'R-Defense-PulseLas': 'GuardTower-BeamLas',
      'R-Defense-Super-Missile': 'X-Super-Missile',
      'R-Defense-Tower01': 'GuardTower1',
      'R-Defense-Tower06': 'GuardTower6',
      'R-Defense-Wall-RotMg': 'Wall-RotMg',
      'R-Defense-WallTower-HPVcannon': 'WallTower-HPVcannon',
      'R-Defense-WallTower-PulseLas': 'WallTower-PulseLas',
      'R-Defense-WallTower-TwinAGun': 'WallTower-TwinAssaultGun',
      'R-Defense-WallTower01': 'WallTower01',
    };
    var droidWeaponResearch = {
      'R-Wpn-Cannon1Mk1': 'Cannon1Mk1',
      'R-Wpn-Cannon2Mk1': 'Cannon2A-TMk1',
      'R-Wpn-Cannon3Mk1': 'Cannon375mmMk1',
      'R-Wpn-Cannon4AMk1': 'Cannon4AUTOMk1',
      'R-Wpn-Cannon5': 'Cannon5VulcanMk1',
      'R-Wpn-Cannon6TwinAslt': 'Cannon6TwinAslt',
      'R-Wpn-Flame2': 'Flame2',
      'R-Wpn-Flamer01Mk1': 'Flame1Mk1',
      'R-Wpn-Howitzer-Incenediary': 'Howitzer-Incenediary',
      'R-Wpn-Howitzer03-Rot': 'Howitzer03-Rot',
      'R-Wpn-HowitzerMk1': 'Howitzer105Mk1',
      'R-Wpn-HvArtMissile': 'Missile-HvyArt',
      'R-Wpn-HvyHowitzer': 'Howitzer150Mk1',
      'R-Wpn-HvyLaser': 'HeavyLaser',
      'R-Wpn-Laser01': 'Laser3BEAMMk1',
      'R-Wpn-Laser02': 'Laser2PULSEMk1',
      'R-Wpn-MG1Mk1': 'MG1Mk1',
      'R-Wpn-MG2Mk1': 'MG2Mk1',
      'R-Wpn-MG3Mk1': 'MG3Mk1',
      'R-Wpn-MG4': 'MG4ROTARYMk1',
      'R-Wpn-MG5': 'MG5TWINROTARY',
      'R-Wpn-MdArtMissile': 'Missile-MdArt',
      'R-Wpn-Missile2A-T': 'Missile-A-T',
      'R-Wpn-Mortar-Incenediary': 'Mortar-Incenediary',
      'R-Wpn-Mortar01Lt': 'Mortar1Mk1',
      'R-Wpn-Mortar02Hvy': 'Mortar2Mk1',
      'R-Wpn-Mortar3': 'Mortar3ROTARYMk1',
      'R-Wpn-PlasmaCannon': 'Laser4-PlasmaCannon',
      'R-Wpn-Plasmite-Flamer': 'PlasmiteFlamer',
      'R-Wpn-RailGun01': 'RailGun1Mk1',
      'R-Wpn-RailGun02': 'RailGun2Mk1',
      'R-Wpn-RailGun03': 'RailGun3Mk1',
      'R-Wpn-Rocket01-LtAT': 'Rocket-LtA-T',
      'R-Wpn-Rocket02-MRL': 'Rocket-MRL',
      'R-Wpn-Rocket03-HvAT': 'Rocket-BB',
      'R-Wpn-Rocket05-MiniPod': 'Rocket-Pod',
      'R-Wpn-Rocket06-IDF': 'Rocket-IDF',
      'R-Wpn-Rocket07-Tank-Killer': 'Rocket-HvyA-T',
    };
    var propulsionResearch = {
      'R-Vehicle-Prop-Halftracks': 'HalfTrack',
      'R-Vehicle-Prop-Hover': 'hover01',
      'R-Vehicle-Prop-Tracks': 'tracked01',
    };

    if(defenseStructureResearch[research.name]){
        defenseStructures.push(defenseStructureResearch[research.name]);

    }else if(bodyResearch[research.name]){
        bodies.push(bodyResearch[research.name]);

    }else if(droidWeaponResearch[research.name]){
        droidWeapons.push(droidWeaponResearch[research.name]);

    }else if(propulsionResearch[research.name]){
        propulsion.push(propulsionResearch[research.name]);
    }
}

function init(){
    perSecond();
    setTimer(
      'perSecond',
      1000
    );
    setTimer(
      'perMinute',
      60000
    );
}

function perMinute(){
    if(groupSize(groupAttack) >= minDroidsAttackStructures){
        var droids = enumGroup(groupAttack);
        droids.some(function check_droid(droid){
            randomLocation(droid);
        });
    }

    var droids = enumDroid(me);
    var structures = enumStruct(me);

    droids.some(function check_droid(droid){
        if(droid.group === groupAttack){
            return;
        }

        if(droid.order === DORDER_BUILD
          || droid.order === DORDER_HELPBUILD){
            return;
        }

        var randomStructure = structures[Math.floor(Math.random() * structures.length)];
        if(randomStructure !== undefined){
            orderDroidLoc(
              droid,
              DORDER_SCOUT,
              randomStructure.x,
              randomStructure.y
            );
        }
    });
}

function perSecond(){
    var researchFacilities = enumStruct(
      me,
      'A0ResearchFacility'
    );
    researchFacilities.some(function check_researchFacility(researchFacility){
        if(researchFacility.status !== BUILT
          || !structureIdle(researchFacility)){
            return;
        }

        if(researchRandom){
            randomResearch(researchFacility);

        }else{
            startResearch(
              researchFacility,
              researchOrder
            );
        }
    });

    var droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    var droidCount = droids.length;
    var lessThan2 = droidCount < 2;
    var structures = enumStruct(me);

    if(productionBegin
      || groupSize(groupDefend) < maxDroidsDefend){
        var factories = enumStruct(
          me,
          'A0LightFactory'
        );
        factories.some(function check_factory(factory){
            if(factory.status !== BUILT
              || !structureIdle(factory)
              || droidWeapons.length === 0){
                return;
            }

            var droidBody = bodies[Math.floor(Math.random() * bodies.length)];
            var droidPropulsion = propulsion[Math.floor(Math.random() * propulsion.length)];
            var droidWeapon0 = droidWeapons[Math.floor(Math.random() * droidWeapons.length)];
            var droidWeapon1 = droidBody === 'Body14SUP'
              ? droidWeapons[Math.floor(Math.random() * droidWeapons.length)]
              : undefined;

            buildDroid(
              factory,
              'droid-' + droidBody + '-' + droidPropulsion + '-' + droidWeapon0
                + (droidWeapon1 !== undefined ? '+' + droidWeapon1 : ''),
              droidBody,
              droidPropulsion,
              '',
              DROID_WEAPON,
              droidWeapon0,
              droidWeapon1
            );
        });
    }

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

        }else if(checkStructure(
            'A0Sat-linkCentre',
            1
          )){
            buildStructure(
              droid,
              'A0Sat-linkCentre'
            );

        }else{
            var factoryModuleNeeded = checkNeedModule(
              'A0LightFactory',
              'A0FacMod1',
              2
            );
            var powerModuleNeeded = checkNeedModule(
              'A0PowerGenerator',
              'A0PowMod1',
              1
            );
            var researchModuleNeeded = checkNeedModule(
              'A0ResearchFacility',
              'A0ResearchModule1',
              1
            );

            if(powerModuleNeeded !== false){
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

            }else{
                var defenseStructure = defenseStructures[Math.floor(Math.random() * defenseStructures.length)];

                if(checkStructure(
                    defenseStructure,
                    maxDefenseStructures
                  )){
                    buildStructure(
                      droid,
                      defenseStructure
                    );
                }
            }
        }
    });

    if(droidCount < maxConstructionDroids){
        var factories = enumStruct(
          me,
          'A0LightFactory'
        );
        factories.some(function check_factory(factory){
            if(factory.status !== BUILT
              || !structureIdle(factory)){
                return;
            }

            var droidBody = bodies[Math.floor(Math.random() * bodies.length)];
            var droidPropulsion = propulsion[Math.floor(Math.random() * propulsion.length)];
            var droidWeapon1 = droidBody === 'Body14SUP'
              ? 'SensorTurret1Mk1'
              : undefined;

            buildDroid(
              factory,
              'drone-' + droidBody + '-' + droidPropulsion + '-Spade1Mk1'
                + (droidWeapon1 !== undefined ? '+' + droidWeapon1 : ''),
              droidBody,
              droidPropulsion,
              '',
              DROID_CONSTRUCT,
              'Spade1Mk1',
              droidWeapon1
            );
        });
    }

    var attacking = false;
    playerData.forEach(function(player, id){
        if(attacking
          || groupSize(groupAttack) < minDroidsAttack
          || allianceExistsBetween(me, id)){
            return;
        }

        if(groupSize(groupAttack) >= minDroidsAttackStructures){
            var enemyList = [
              DEFENSE,
              FACTORY,
              CYBORG_FACTORY,
              VTOL_FACTORY,
              RESOURCE_EXTRACTOR,
              RESEARCH_LAB,
              SAT_UPLINK,
              LASSAT,
              POWER_GEN,
              HQ,
              REPAIR_FACILITY,
              COMMAND_CONTROL,
              REARM_PAD,
              WALL,
              GATE,
            ];
            for(var enemy in enemyList){
                var enemies = enumStruct(
                  id,
                  enemyList[enemy],
                  me
                );
                if(enemies.length > 0){
                    attack(
                      groupAttack,
                      enemies[enemies.length - 1],
                      true
                    );
                    attacking = true;
                    return;
                }
            }
        }

        var droids = enumDroid(
          id,
          DROID_ANY,
          me
        );
        if(droids.length > 0){
            attack(
              groupAttack,
              droids[droids.length - 1],
              true
            );
            attacking = true;
            return;
        }
    });

    setMiniMap(true);
}

function randomResearch(researchFacility){
    var research = enumResearch();

    if(research.length === 0){
        maxConstructionDroids = 6;
        maxResearchFacilities = 1;
        return;
    }

    startResearch(
      researchFacility,
      research[Math.floor(Math.random() * research.length)].name
    );
}

function startResearch(researchFacility, research){
    if(!researchRandom){
        var targetResearch = getResearch('R-Sys-Autorepair-General');

        if(targetResearch.done
          || targetResearch.started){
            productionBegin = true;
            researchRandom = true;
        }
    }

    pursueResearch(
      researchFacility,
      research
    );
}

var bodies = ['Body1REC'];
var defenseStructures = [];
var droidWeapons = [];
var groupAttack = newGroup();
var groupDefend = newGroup();
var limitDroidsAttack = 40;
var maxConstructionDroids = 3;
var maxDefenseStructures = 3;
var maxDroidsDefend = 20;
var maxResourceExtractors = 4;
var minDroidsAttack = 10;
var minDroidsAttackStructures = 40;
var productionBegin = false;
var propulsion = ['wheeled01'];
var researchRandom = false;

var researchOrder = [
  'R-Sys-Engineering01',
  'R-Vehicle-Engine01',
  'R-Sys-Sensor-Turret01',
  'R-Wpn-MG1Mk1',
  'R-Wpn-Flamer01Mk1',
  'R-Sys-Sensor-Tower01',
  'R-Struc-PowerModuleMk1',
  'R-Struc-CommandRelay',
  'R-Struc-Research-Module',
  'R-Struc-Research-Upgrade01',
  'R-Struc-Research-Upgrade02',
  'R-Struc-Research-Upgrade03',
  'R-Struc-Research-Upgrade04',
  'R-Struc-Power-Upgrade01',
  'R-Struc-Research-Upgrade05',
  'R-Struc-Power-Upgrade01b',
  'R-Struc-Research-Upgrade06',
  'R-Struc-Power-Upgrade01c',
  'R-Struc-Research-Upgrade07',
  'R-Struc-Power-Upgrade02',
  'R-Struc-Research-Upgrade08',
  'R-Struc-Power-Upgrade03',
  'R-Struc-Research-Upgrade09',
  'R-Struc-Power-Upgrade03a',
  'R-Sys-Autorepair-General',
];
