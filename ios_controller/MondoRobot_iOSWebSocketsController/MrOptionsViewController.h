//
//  MrOptionsViewController.h
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/20/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MrBaseViewController.h"

@interface MrOptionsViewController : MrBaseViewController<MrViewControllerProtocol>

@property (nonatomic, retain) IBOutlet UILabel      *lblConnected;
@property (nonatomic, retain) IBOutlet UILabel      *lblMyAddress;

- (id)initWithRootViewController:(MrRootViewController *)rootControler;

@end
