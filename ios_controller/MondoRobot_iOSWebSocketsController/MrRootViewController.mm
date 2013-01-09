//
//  MrRootViewController.m
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/20/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import "MrRootViewController.h"

#include "websocketpp.hpp"

#import "osc/transport/OscUdpSender.h"
#import "osc/transport/OscTcpSender.h"
#import "osc/OscUtils.h"
#import "HostUtils.h"

@interface MrRootViewController ()

- (void)showTurnDeviceView;
- (void)showOptionsView;
- (void)showControllerView;
- (void)showTestView;

- (void)showViewController:(UIViewController *)controller;
- (BOOL)isViewControllerShowing:(UIViewController *)controller;
- (UIViewController *)activeViewController;

@end

@implementation MrRootViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
        _showControllerOnConnect = YES;
        _buffer = NULL;
        _isInitialized = NO;
        _isRunning = NO;
        _isConnected = NO;
    }
    return self;
}

- (void)dealloc
{
    [_turnDeviceViewController release];
    [_optionsViewController release];
    [_controllerViewController release];
    [_testViewController release];
    
    [self stopServer];
    
    [super dealloc];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    if(self.interfaceOrientation != UIInterfaceOrientationLandscapeLeft &&
       self.interfaceOrientation != UIInterfaceOrientationLandscapeRight)
    {
        [self showTurnDeviceView];
    }
    else
    {
        [self showOptionsView];
    }
    
    [self initializeServer];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)initializeServer
{
    if(_isInitialized == NO)
    {
        _server = mr::WebSocketServerPtr(new mr::WebSocketServer());
        _server->setDelegate(self);
        _server->start();
        _isRunning = YES;
        
        _buffer = (char *)malloc(OUTPUT_BUFFER_SIZE);
        _oscOutput = std::shared_ptr<osc::OutboundPacketStream>(new osc::OutboundPacketStream( _buffer, OUTPUT_BUFFER_SIZE));
        
        _isInitialized = YES;
    }
}

- (void)didEnterBackground
{
    // Can't seem to shutdown the server in a nice way.
    // [self stopServer];
}

- (void)didEnterForeground
{
    // [self startServer];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return YES;
}

- (void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
{
    NSInteger orientation = self.interfaceOrientation;
    
    if(orientation != UIInterfaceOrientationLandscapeLeft &&
       orientation != UIInterfaceOrientationLandscapeRight)
    {
        [self showTurnDeviceView];
    }
    else if(_isConnected)
    {
        [self showControllerView];
    }
    else
    {
        [self showOptionsView];
    }
}

- (void)send:(const char *)data size:(size_t)size
{
    _server->send(data, size);
}

- (mr::WebSocketServerPtr)server
{
    return _server;
}

- (std::shared_ptr<osc::OutboundPacketStream>)oscOutput
{
    return _oscOutput;
}

- (void)connectionFailed
{
    _isConnected = NO;
    
    [_turnDeviceViewController connectionFailed];
    [_optionsViewController connectionFailed];
    [_controllerViewController connectionFailed];
    [_testViewController connectionFailed];
}

- (void)connectionOpened
{
    _isConnected = YES;
    
    [_turnDeviceViewController connectionOpened];
    [_optionsViewController connectionOpened];
    [_controllerViewController connectionOpened];
    [_testViewController connectionOpened];
    
    if(_showControllerOnConnect)
    {
        [self showControllerView];
    }
}

- (void)connectionClosed
{
    _isConnected = NO;
    
    [_turnDeviceViewController connectionClosed];
    [_optionsViewController connectionClosed];
    [_controllerViewController connectionClosed];
    [_testViewController connectionClosed];
    
    if(self.activeViewController == _controllerViewController)
        [self showOptionsView];
}

- (void)showViewController:(UIViewController *)controller
{
    UIViewController *fromViewController = nil;
    if(self.childViewControllers.count > 0)
    {
        fromViewController = [self.childViewControllers objectAtIndex:0];
    }

    
    CGRect frame = controller.view.frame;
    CGSize mySize = self.view.bounds.size;
    frame.size.width = mySize.width;
    frame.size.height = mySize.height;
    controller.view.frame = frame;
    
    [UIView transitionWithView:self.view
                      duration:0.2
                       options:UIViewAnimationOptionTransitionCrossDissolve
                    animations:^{
                        if(fromViewController)
                            [fromViewController.view removeFromSuperview];
                        [self.view addSubview:controller.view]; }
                    completion:NULL];

    if(fromViewController)
    [fromViewController removeFromParentViewController];

    [self addChildViewController:controller];
}

- (BOOL)isViewControllerShowing:(UIViewController *)controller
{
    return (controller != nil &&
            self.childViewControllers.count > 0 &&
            [self.childViewControllers objectAtIndex:0] == controller);
}

- (UIViewController *)activeViewController
{
    UIViewController *childViewController = nil;
    if(self.childViewControllers.count > 0)
    {
        childViewController = [self.childViewControllers objectAtIndex:0];
    }
    
    return childViewController;
}

- (void)viewDidLayoutSubviews
{

}

- (MrTurnDeviceViewController *)turnDeviceViewController
{
    if(!_turnDeviceViewController)
    {
        _turnDeviceViewController = [[MrTurnDeviceViewController alloc] initWithRootViewController:self];
    }
    
    return _turnDeviceViewController;
}

- (void)showTurnDeviceView
{
    [self showViewController:self.turnDeviceViewController];
}

- (BOOL)isTurnDeviceViewShowing
{
    return [self isViewControllerShowing:_turnDeviceViewController];
}

- (MrOptionsViewController *)optionsViewController
{
    if(!_optionsViewController)
    {
        _optionsViewController = [[MrOptionsViewController alloc] initWithRootViewController:self];
    }
    
    return _optionsViewController;
}

- (void)showOptionsView
{
    [self showViewController:self.optionsViewController];
}

- (BOOL)isOptionsViewShowing
{
    return [self isViewControllerShowing:_optionsViewController];
}

- (MrControllerViewController *)controllerViewcontrller
{
    if(!_controllerViewController)
    {
        _controllerViewController = [[MrControllerViewController alloc] initWithRootViewController:self];
    }
    
    return _controllerViewController;
}

- (void)showControllerView
{
    [self showViewController:self.controllerViewcontrller];
}

- (BOOL)isControllerViewShowing
{
    return [self isViewControllerShowing:_controllerViewController];
}

- (MrTestViewController *)testViewController
{
    if(!_testViewController)
    {
        _testViewController = [[MrTestViewController alloc] initWithRootViewController:self];
    }
    
    return _testViewController;
}

- (void)showTestView
{
    [self showViewController:self.testViewController];
}

- (BOOL)isTestViewShowing
{
    return [self isViewControllerShowing:_testViewController];
}

@end
