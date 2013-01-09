//
//  MrViewController.m
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/18/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import "MrTestViewController.h"



@interface MrTestViewController ()


@end

@implementation MrTestViewController

@synthesize scrollView   = _scrollView;
@synthesize scrollChild  = _scrollChild;

- (id)initWithRootViewController:(MrRootViewController *)rootControler
{
    return [super initWithNibName:@"MrTestViewController" bundle:nil root:rootControler];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
}

- (void)dealloc
{
    [super dealloc];
    free(_buffer);
    _buffer = 0;
    
    self.scrollView = nil;
    self.scrollChild = nil;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)goButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test1" )
    << true << 23 << (float)3.1415 << "hello" << osc::EndMessage
    << osc::BeginMessage( "/test2" )
    << true << 24 << (float)10.8 << "world" << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)trueButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << true << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)falseButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << false << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)nilButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << osc::OscNil << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)infinitumButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << osc::Infinitum << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)int32ButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    osc::int32 i = 234;
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)floatButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    float i = 3.1415;
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)charButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    char i = 'R';
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)rgbButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    osc::RgbaColor i(0x01020304);
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)midiButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    osc::MidiMessage i(0x04030201);
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)int64ButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    osc::int64 i = 0xffffffffffffff;
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)timeButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    osc::TimeTag i(0xFFFF);
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)doubleButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    double i = 235235252.223235;
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)stringButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    const char *i = "This is my string. Yayyy!";
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)symbolButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    osc::Symbol i("Symbol Text");
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)blobButtonPressed:(id)sender
{
    _oscOutput->Clear();
    
    char b[5];
    memset(b, 0xFE, 5);
    osc::Blob i(b, 5);
    *_oscOutput << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test3" )
    << i << osc::EndMessage
    << osc::EndBundle;
    
    [self send:_oscOutput->Data() size:_oscOutput->Size()];
}

- (IBAction)bombardButtonPressed:(id)sender
{
    for(int n = 1000; n < 1024; n++)
    {
        _oscOutput->Clear();
        
        *_oscOutput << osc::BeginBundleImmediate
        << osc::BeginMessage( "/test3" )
        << n << osc::EndMessage
        << osc::EndBundle;
        
        [self send:_oscOutput->Data() size:_oscOutput->Size()];
    }
}

@end
