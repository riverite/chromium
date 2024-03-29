// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "ios/chrome/browser/autofill/strike_database_factory.h"

#include <utility>

#include "base/memory/singleton.h"
#include "components/autofill/core/browser/strike_database.h"
#include "components/keyed_service/ios/browser_state_dependency_manager.h"
#include "ios/chrome/browser/application_context.h"
#include "ios/chrome/browser/browser_state/chrome_browser_state.h"

namespace autofill {

// static
StrikeDatabase* StrikeDatabaseFactory::GetForBrowserState(
    ios::ChromeBrowserState* browser_state) {
  return static_cast<StrikeDatabase*>(
      GetInstance()->GetServiceForBrowserState(browser_state, true));
}

// static
StrikeDatabaseFactory* StrikeDatabaseFactory::GetInstance() {
  return base::Singleton<StrikeDatabaseFactory>::get();
}

StrikeDatabaseFactory::StrikeDatabaseFactory()
    : BrowserStateKeyedServiceFactory(
          "AutofillStrikeDatabase",
          BrowserStateDependencyManager::GetInstance()) {}

StrikeDatabaseFactory::~StrikeDatabaseFactory() {}

std::unique_ptr<KeyedService> StrikeDatabaseFactory::BuildServiceInstanceFor(
    web::BrowserState* context) const {
  ios::ChromeBrowserState* chrome_browser_state =
      ios::ChromeBrowserState::FromBrowserState(context);
  return std::make_unique<autofill::StrikeDatabase>(
      chrome_browser_state->GetStatePath().Append(
          FILE_PATH_LITERAL("AutofillStrikeDatabase")));
}

}  // namespace autofill
