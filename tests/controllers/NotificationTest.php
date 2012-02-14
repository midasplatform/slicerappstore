<?php
/*=========================================================================
MIDAS Server
Copyright (c) Kitware SAS. 20 rue de la Villette. All rights reserved.
69328 Lyon, FRANCE.

See Copyright.txt for details.
This software is distributed WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE.  See the above copyright notices for more information.
=========================================================================*/

/** test slicerpackages notifier behavior */
class NotificationTest extends ControllerTestCase
{
  /** set up tests*/
  public function setUp()
    {
    $this->enabledModules = array('slicerappstore');
    parent::setUp();
    } // end function setUp

  /** Make sure that we get the proper API hooks */
  public function testApi()
    {
    $this->dispatchUrI('/api');
    // TODO Not actually a test
    } // end function testApi

} // end class NotificationTest
