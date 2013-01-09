//
//  OscTcpData.h
//  Hydrogen_OscIosSender
//
//  Created by Rick Boykin on 11/28/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __Hydrogen_OscIosSender__OscTcpData__
#define __Hydrogen_OscIosSender__OscTcpData__

#include <iostream>

namespace osc {
    namespace transport {
        namespace tcp {
            extern char HeartbeatSig[4];
            
            int IsHeartbeatSig(const char * data);
        }
    }
}

#endif /* defined(__Hydrogen_OscIosSender__OscTcpData__) */
