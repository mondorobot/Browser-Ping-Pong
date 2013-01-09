//
//  MrControlerViewController.h
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/20/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MrBaseViewController.h"

#define kMR_FLASH_COUNT 6

@interface MrControllerViewController : MrBaseViewController
{
    NSInteger _flashCount;
}
@property (nonatomic, retain) IBOutlet UILabel *lblInstruction;

- (id)initWithRootViewController:(MrRootViewController *)rootControler;

@end
