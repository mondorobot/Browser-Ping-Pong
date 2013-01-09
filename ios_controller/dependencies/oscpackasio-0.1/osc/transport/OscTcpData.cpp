//
//  OscTcpData.cpp
//  Hydrogen_OscIosSender
//
//  Created by Rick Boykin on 11/28/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#include "OscTcpData.h"

namespace osc {
    namespace transport {
        namespace tcp {
            
            int IsHeartbeatSig(const char * data)
            {
                return data[0] == HeartbeatSig[0] &&
                data[1] == HeartbeatSig[1] &&
                data[2] == HeartbeatSig[2] &&
                data[3] == HeartbeatSig[3];
            }
            
            char HeartbeatSig[4] = { '\xFF', '\xFF', '\xFF', '\xFE' };
        }
    }
}